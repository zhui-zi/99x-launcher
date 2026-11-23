import fs from 'node:fs'
import path from 'node:path'
import { shell } from 'electron'

export interface MapFileEntry {
  id: string
  name: string
  source: 'workshop' | 'local_maps'
  workshopId?: string
  filePath: string
  sizeBytes: number
  mtimeMs: number
  fileCount: number
}

export interface MapScanResult {
  workshopDir: string
  localMapsDir: string
  totalSizeBytes: number
  entries: MapFileEntry[]
}

const workshopTitleCache = new Map<string, string>()

async function fetchWorkshopTitlesBatch(ids: string[]): Promise<void> {
  const missing = ids.filter((id) => /^\d+$/.test(id) && !workshopTitleCache.has(id))
  if (missing.length === 0) return

  // Steam API supports batching up to 50 publishedfileids per request with zero API key
  for (let i = 0; i < missing.length; i += 50) {
    const chunk = missing.slice(i, i + 50)
    const params = new URLSearchParams()
    params.set('itemcount', String(chunk.length))
    chunk.forEach((id, idx) => params.set(`publishedfileids[${idx}]`, id))

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    try {
      const res = await fetch(
        'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
          signal: controller.signal
        }
      )
      if (res.ok) {
        const json: any = await res.json()
        const details = json?.response?.publishedfiledetails
        if (Array.isArray(details)) {
          for (const d of details) {
            if (d?.publishedfileid && d?.title) {
              workshopTitleCache.set(String(d.publishedfileid), String(d.title).trim())
            }
          }
        }
      }
    } catch {
      // ignore network failure and fall back to local names
    } finally {
      clearTimeout(timer)
    }
  }
}

function getDirStats(dirPath: string): {
  sizeBytes: number
  fileCount: number
  latestMtime: number
  firstVpkName: string
} {
  let sizeBytes = 0
  let fileCount = 0
  let latestMtime = 0
  let firstVpkName = ''

  const walk = (p: string) => {
    let items: fs.Dirent[]
    try {
      items = fs.readdirSync(p, { withFileTypes: true })
    } catch {
      return
    }
    for (const item of items) {
      const full = path.join(p, item.name)
      if (item.isDirectory()) {
        walk(full)
      } else {
        try {
          const st = fs.statSync(full)
          sizeBytes += st.size
          fileCount += 1
          if (st.mtimeMs > latestMtime) latestMtime = st.mtimeMs
          if (!firstVpkName && (item.name.endsWith('.vpk') || item.name.endsWith('.bsp'))) {
            firstVpkName = item.name.replace(/(_dir)?\.(vpk|bsp)$/i, '')
          }
        } catch {
          // ignore
        }
      }
    }
  }

  walk(dirPath)
  return { sizeBytes, fileCount, latestMtime, firstVpkName }
}

function resolveWorkshopDir(cs2Path: string): string {
  if (!cs2Path) return ''
  const steamappsDir = path.resolve(cs2Path, '..', '..')
  const candidate = path.join(steamappsDir, 'workshop', 'content', '730')
  if (fs.existsSync(candidate)) return candidate
  return ''
}

export async function scanCs2MapFiles(cs2Path: string): Promise<MapScanResult> {
  const entries: MapFileEntry[] = []
  const workshopDir = resolveWorkshopDir(cs2Path)
  const localMapsDir = cs2Path ? path.join(cs2Path, 'game', 'csgo', 'maps') : ''
  const workshopIdsToResolve: string[] = []

  // 1. Scan Steam Workshop CS2 content (730)
  if (workshopDir && fs.existsSync(workshopDir)) {
    try {
      const dirs = fs.readdirSync(workshopDir, { withFileTypes: true })
      for (const d of dirs) {
        if (!d.isDirectory()) continue
        const full = path.join(workshopDir, d.name)
        const stats = getDirStats(full)
        if (stats.sizeBytes === 0 && stats.fileCount === 0) continue
        const st = fs.statSync(full)
        workshopIdsToResolve.push(d.name)
        entries.push({
          id: `ws_${d.name}`,
          name: stats.firstVpkName && stats.firstVpkName !== d.name ? stats.firstVpkName : `Workshop #${d.name}`,
          source: 'workshop',
          workshopId: d.name,
          filePath: full,
          sizeBytes: stats.sizeBytes,
          mtimeMs: stats.latestMtime || st.mtimeMs,
          fileCount: stats.fileCount
        })
      }
    } catch {
      // ignore
    }
  }

  // 2. Scan custom/community maps in game/csgo/maps
  if (localMapsDir && fs.existsSync(localMapsDir)) {
    const communityPrefix = /^(ze_|zm_|mg_|surf_|kz_|bhop_|rp_|ttt_|jb_|ba_|ph_|dr_|aim_|awp_)/i
    try {
      const items = fs.readdirSync(localMapsDir, { withFileTypes: true })
      for (const item of items) {
        const full = path.join(localMapsDir, item.name)
        if (item.isDirectory() && item.name.toLowerCase() === 'workshop') {
          const wsSubs = fs.readdirSync(full, { withFileTypes: true })
          for (const sub of wsSubs) {
            const subPath = path.join(full, sub.name)
            if (sub.isDirectory()) {
              const stats = getDirStats(subPath)
              if (stats.sizeBytes > 0) {
                workshopIdsToResolve.push(sub.name)
                entries.push({
                  id: `local_ws_${sub.name}`,
                  name: stats.firstVpkName || sub.name,
                  source: 'local_maps',
                  workshopId: sub.name,
                  filePath: subPath,
                  sizeBytes: stats.sizeBytes,
                  mtimeMs: stats.latestMtime || Date.now(),
                  fileCount: stats.fileCount
                })
              }
            }
          }
        } else if (item.isFile() && /\.(vpk|bsp)$/i.test(item.name) && communityPrefix.test(item.name)) {
          const st = fs.statSync(full)
          entries.push({
            id: `local_file_${item.name}`,
            name: item.name.replace(/\.(vpk|bsp)$/i, ''),
            source: 'local_maps',
            filePath: full,
            sizeBytes: st.size,
            mtimeMs: st.mtimeMs,
            fileCount: 1
          })
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Resolve real Steam Workshop map names in batch
  if (workshopIdsToResolve.length > 0) {
    await fetchWorkshopTitlesBatch(workshopIdsToResolve)
    for (const e of entries) {
      if (e.workshopId) {
        const resolved = workshopTitleCache.get(e.workshopId)
        if (resolved) {
          e.name = resolved
        }
      }
    }
  }

  entries.sort((a, b) => b.sizeBytes - a.sizeBytes)
  const totalSizeBytes = entries.reduce((acc, e) => acc + e.sizeBytes, 0)

  return {
    workshopDir,
    localMapsDir: fs.existsSync(localMapsDir) ? localMapsDir : '',
    totalSizeBytes,
    entries
  }
}

export async function deleteMapFiles(
  paths: string[],
  moveToTrash = true
): Promise<{ deletedCount: number; freedBytes: number; errors: string[] }> {
  let deletedCount = 0
  let freedBytes = 0
  const errors: string[] = []

  for (const target of paths) {
    try {
      if (!fs.existsSync(target)) continue
      const st = fs.statSync(target)
      const size = st.isDirectory() ? getDirStats(target).sizeBytes : st.size
      if (moveToTrash) {
        await shell.trashItem(target)
      } else {
        fs.rmSync(target, { recursive: true, force: true })
      }
      deletedCount += 1
      freedBytes += size
    } catch (err: any) {
      errors.push(`${path.basename(target)}: ${err?.message || '删除失败'}`)
    }
  }

  return { deletedCount, freedBytes, errors }
}
