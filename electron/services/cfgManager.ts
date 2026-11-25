import fs from 'node:fs'
import path from 'node:path'

export interface CfgFileInfo {
  name: string
  filePath: string
  sizeBytes: number
  mtimeMs: number
}

export function getCfgDir(cs2Path: string): string {
  if (!cs2Path) return ''
  return path.join(cs2Path, 'game', 'csgo', 'cfg')
}

export function listCfgFiles(cs2Path: string): { cfgDir: string; files: CfgFileInfo[] } {
  const cfgDir = getCfgDir(cs2Path)
  if (!cfgDir || !fs.existsSync(cfgDir)) {
    return { cfgDir, files: [] }
  }
  try {
    const items = fs.readdirSync(cfgDir, { withFileTypes: true })
    const files: CfgFileInfo[] = []
    for (const item of items) {
      if (!item.isFile() || !item.name.toLowerCase().endsWith('.cfg')) continue
      const full = path.join(cfgDir, item.name)
      try {
        const st = fs.statSync(full)
        files.push({
          name: item.name,
          filePath: full,
          sizeBytes: st.size,
          mtimeMs: st.mtimeMs
        })
      } catch {
        // ignore
      }
    }
    files.sort((a, b) => {
      if (a.name.toLowerCase() === 'autoexec.cfg') return -1
      if (b.name.toLowerCase() === 'autoexec.cfg') return 1
      return a.name.localeCompare(b.name)
    })
    return { cfgDir, files }
  } catch {
    return { cfgDir, files: [] }
  }
}

export function readCfgFile(cs2Path: string, fileName: string): {
  exists: boolean
  filePath: string
  content: string
} {
  const cfgDir = getCfgDir(cs2Path)
  if (!cfgDir) return { exists: false, filePath: '', content: '' }
  const safeName = path.basename(fileName || 'autoexec.cfg')
  const target = path.join(cfgDir, safeName)
  if (!fs.existsSync(target)) {
    return { exists: false, filePath: target, content: '' }
  }
  return {
    exists: true,
    filePath: target,
    content: fs.readFileSync(target, 'utf8')
  }
}

export function writeCfgFile(
  cs2Path: string,
  fileName: string,
  content: string
): { success: boolean; filePath?: string; error?: string } {
  try {
    const cfgDir = getCfgDir(cs2Path)
    if (!cfgDir || !fs.existsSync(cfgDir)) {
      return { success: false, error: '未找到 CS2 cfg 目录，请先在设置中配置正确的 CS2 安装路径' }
    }
    const safeName = path.basename(fileName || 'autoexec.cfg')
    const finalName = safeName.toLowerCase().endsWith('.cfg') ? safeName : `${safeName}.cfg`
    const target = path.join(cfgDir, finalName)

    // Backup existing file once if it exists
    if (fs.existsSync(target)) {
      const backup = `${target}.bak`
      if (!fs.existsSync(backup)) {
        fs.copyFileSync(target, backup)
      }
    }
    fs.writeFileSync(target, content, 'utf8')
    return { success: true, filePath: target }
  } catch (err: any) {
    return { success: false, error: err?.message || '写入 CFG 文件失败' }
  }
}

export interface Cs2UserKeysResult {
  found: boolean
  filePath: string
  /** Key (lowercase) -> CS2 command string; "<unbound>" means explicitly unbound in CS2 */
  bindings: Record<string, string>
}

function parseVcfgBindings(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const bindingsIdx = text.search(/"bindings"\s*\{/i)
  if (bindingsIdx === -1) return result
  const openBrace = text.indexOf('{', bindingsIdx)
  if (openBrace === -1) return result

  // Extract the balanced "bindings" { ... } block
  let depth = 0
  let closeBrace = -1
  for (let i = openBrace; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) {
        closeBrace = i
        break
      }
    }
  }
  if (closeBrace === -1) return result

  const block = text.slice(openBrace + 1, closeBrace)
  const pairRe = /"([^"]+)"\s+"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = pairRe.exec(block)) !== null) {
    const key = m[1].trim().toLowerCase()
    const cmd = m[2].trim()
    if (key) {
      result[key] = cmd
    }
  }
  return result
}

export function readCs2UserKeys(steamPath: string): Cs2UserKeysResult {
  const empty: Cs2UserKeysResult = { found: false, filePath: '', bindings: {} }
  if (!steamPath) return empty
  const userdataDir = path.join(steamPath, 'userdata')
  if (!fs.existsSync(userdataDir)) return empty

  try {
    const accounts = fs.readdirSync(userdataDir, { withFileTypes: true })
    let latestFile = ''
    let latestMtime = 0

    for (const acc of accounts) {
      if (!acc.isDirectory() || acc.name === '0') continue
      const candidate = path.join(
        userdataDir,
        acc.name,
        '730',
        'local',
        'cfg',
        'cs2_user_keys_0_slot0.vcfg'
      )
      if (!fs.existsSync(candidate)) continue
      try {
        const st = fs.statSync(candidate)
        if (st.mtimeMs >= latestMtime) {
          latestMtime = st.mtimeMs
          latestFile = candidate
        }
      } catch {
        // ignore unreadable entries
      }
    }

    if (!latestFile) return empty
    const raw = fs.readFileSync(latestFile, 'utf8')
    return {
      found: true,
      filePath: latestFile,
      bindings: parseVcfgBindings(raw)
    }
  } catch {
    return empty
  }
}
