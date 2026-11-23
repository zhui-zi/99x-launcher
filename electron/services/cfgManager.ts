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
