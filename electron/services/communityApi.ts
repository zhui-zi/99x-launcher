import fs from 'node:fs'
import path from 'node:path'

export type CommunityId = 'exg' | 'zed' | 'fys'

export interface NormalizedCommunityServer {
  id: string
  community: CommunityId
  group: string
  groupOrder: number
  sort: number
  displayName: string
  fullTitle: string
  ip: string
  port: number
  region: string
  online: boolean
  players: number
  maxPlayers: number
  bots: number
  map: string
  mapDisplayName: string
  mapDifficulty: string
  mapWorkshopId: number
  ping: number
  tags?: string[]
}

export interface ExgOnlineStatPoint {
  timestamp: number
  totalPlayers: number
  onlineServers: number
}

const EXG_SERVER_LIST_URL = 'https://list.darkrp.cn:9000/ServerList/CurrentStatus'
const EXG_ONLINE_STATS_URL = 'https://api.darkrp.cn/api/onlineStats'
const EXG_MAP_LISTS_URL = 'https://api.darkrp.cn/api/mapLists'
const ZED_SERVER_LIST_URL = 'https://s.zombieden.cn/api/open/servers'
const FYS_SERVER_LIST_URL = 'https://cs2.upkk.com/api/servers/search?q=FyS'
const LOCAL_EXG_FALLBACK = 'C:\\Users\\keita\\OneDrive\\Game\\CSGO\\exg小助手\\server.json'

let cachedMapDict: Record<string, { mapNameCN: string; difficulty: string }> | null = null

const DIFFICULTY_NUM_MAP: Record<number, string> = {
  0: '',
  1: '简单',
  2: '普通',
  3: '困难',
  4: '极难',
  5: '梦魇',
  6: '史诗'
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': '99x-launcher/1.0',
        Accept: 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

function classifyExgGroup(id: string, sort: number, displayName: string): { group: string; order: number } {
  const lowerId = (id || '').toLowerCase()
  const lowerName = (displayName || '').toLowerCase()

  if (lowerId.startsWith('cs2ze') && !lowerId.startsWith('cs2zepve')) {
    if (sort >= 1100 || (!displayName.includes('装备') && lowerName.includes('ze'))) {
      return { group: 'ZE 经典服', order: 2 }
    }
    return { group: 'ZE 装备服', order: 1 }
  }
  if (lowerId.startsWith('cs2zepve') || lowerName.includes('pve')) {
    return { group: 'PVE 合作模式', order: 3 }
  }
  if (lowerId.startsWith('cs2home') || displayName.includes('挂机')) {
    return { group: '挂机大厅', order: 4 }
  }
  if (lowerId.startsWith('cs2ph') || displayName.includes('躲猫猫')) {
    return { group: '躲猫猫', order: 5 }
  }
  if (lowerName.includes('surf') || displayName.includes('滑翔')) {
    return { group: 'SURF 滑翔', order: 6 }
  }
  if (lowerId.startsWith('cs2mg') || lowerName.includes('mg')) {
    return { group: 'MG 娱乐闯关', order: 7 }
  }
  return { group: '其他 EXG 服', order: 8 }
}

function classifyFysGroup(name: string, map: string, category: string): { group: string; order: number } {
  const n = (name || '').toLowerCase()
  const m = (map || '').toLowerCase()
  const c = (category || '').toLowerCase()
  if (n.includes('僵尸逃跑') || n.includes('ze') || m.startsWith('ze_') || c.includes('zombie')) {
    return { group: 'FYS 僵尸逃跑 (ZE)', order: 1 }
  }
  if (n.includes('大厅') || m.includes('lobby')) {
    return { group: 'FYS 闲聊大厅', order: 2 }
  }
  if (n.includes('mg') || n.includes('娱乐') || m.startsWith('mg_')) {
    return { group: 'FYS MG 娱乐', order: 3 }
  }
  if (n.includes('连跳') || n.includes('bhop') || m.startsWith('bhop_')) {
    return { group: 'FYS BHOP 连跳', order: 4 }
  }
  if (n.includes('滑翔') || n.includes('surf') || m.startsWith('surf_')) {
    return { group: 'FYS SURF 滑翔', order: 5 }
  }
  return { group: 'FYS 其他玩法', order: 6 }
}

function parseHostPort(raw: string): { ip: string; port: number } {
  const cleaned = (raw || '').trim()
  const idx = cleaned.lastIndexOf(':')
  if (idx === -1) return { ip: cleaned, port: 27015 }
  return { ip: cleaned.slice(0, idx), port: Number(cleaned.slice(idx + 1)) || 27015 }
}

function extractDifficultyFromTags(tags?: string[]): string {
  if (!Array.isArray(tags)) return ''
  for (const t of tags) {
    if (['简单', '普通', '困难', '极难', '梦魇', '史诗'].includes(t)) return t
  }
  return ''
}

export async function fetchExgCommunityServers(): Promise<NormalizedCommunityServer[]> {
  let rawList: any[] = []
  try {
    const data = await fetchJsonWithTimeout<any[]>(EXG_SERVER_LIST_URL, 5500)
    if (Array.isArray(data) && data.length > 0) {
      rawList = data.filter((item) => item?.Server?.Category === 'cs2')
    }
  } catch {
    if (fs.existsSync(LOCAL_EXG_FALLBACK)) {
      const raw = JSON.parse(fs.readFileSync(LOCAL_EXG_FALLBACK, 'utf8'))
      rawList = Array.isArray(raw?.serverList) ? raw.serverList : []
    }
  }

  return rawList.map((item) => {
    const srv = item.Server
    const st = item.Status || {}
    const { group, order } = classifyExgGroup(srv.Id, srv.Sort, srv.DisplayNameCN || srv.DisplayName)
    return {
      id: `exg_${srv.Id}`,
      community: 'exg',
      group,
      groupOrder: order,
      sort: srv.Sort ?? 9999,
      displayName: srv.DisplayName || srv.DisplayNameCN || `${srv.Ip}:${srv.Port}`,
      fullTitle: st.FullTitle || srv.DisplayNameCN || srv.DisplayName || '',
      ip: srv.Ip,
      port: Number(srv.Port) || 27015,
      region: srv.Region || '山东',
      online: (st.MaxPlayers ?? 0) > 0,
      players: Number(st.CurrentPlayers ?? 0),
      maxPlayers: Number(st.MaxPlayers ?? 64),
      bots: Number(st.CurrentBots ?? 0),
      map: st.Map || '',
      mapDisplayName: st.MapDisplayName || '',
      mapDifficulty: st.MapDifficulty || '',
      mapWorkshopId: Number(st.MapWorkshopId || srv.WorkshopId || 0),
      ping: -1
    }
  })
}

export async function fetchZedCommunityServers(): Promise<NormalizedCommunityServer[]> {
  try {
    const resp = await fetchJsonWithTimeout<{ code: number; data: any[] }>(ZED_SERVER_LIST_URL, 6000)
    if (!resp || !Array.isArray(resp.data)) return []

    const result: NormalizedCommunityServer[] = []
    resp.data.forEach((cat, catIdx) => {
      const groupName = String(cat.label || cat.id || 'ZED 服务器').replace(/^CS2-/, '')
      const servers = Array.isArray(cat.servers) ? cat.servers : []
      servers.forEach((s: any, idx: number) => {
        if (s.appId && s.appId !== 730) return
        const { ip, port } = parseHostPort(s.connectIp || s.ip)
        const mapCN = s.mapName && s.mapName !== '暂无译名' ? s.mapName : ''
        result.push({
          id: `zed_${s.id ?? `${ip}_${port}`}`,
          community: 'zed',
          group: groupName,
          groupOrder: catIdx + 1,
          sort: catIdx * 100 + idx,
          displayName: s.title || s.ip || `${ip}:${port}`,
          fullTitle: s.title || '',
          ip,
          port,
          region: 'ZED 节点',
          online: Number(s.maxPlayers ?? 0) > 0,
          players: Number(s.players ?? 0),
          maxPlayers: Number(s.maxPlayers ?? 64),
          bots: 0,
          map: s.map || '',
          mapDisplayName: mapCN,
          mapDifficulty: extractDifficultyFromTags(s.tags),
          mapWorkshopId: 0,
          ping: Number(s.ping ?? -1),
          tags: Array.isArray(s.tags) ? s.tags : []
        })
      })
    })
    return result
  } catch {
    return []
  }
}

export async function fetchFysCommunityServers(): Promise<NormalizedCommunityServer[]> {
  try {
    const resp = await fetchJsonWithTimeout<{ servers?: any[] }>(FYS_SERVER_LIST_URL, 6500)
    const list = Array.isArray(resp?.servers) ? resp.servers : []
    return list
      .filter((s) => s?.ip && s?.port)
      .map((s, idx) => {
        const cleanName = String(s.name || `${s.ip}:${s.port}`).replace(/^❤️\s*/, '').trim()
        const { group, order } = classifyFysGroup(cleanName, s.map_name || '', s.category || '')
        return {
          id: `fys_${s.id ?? `${s.ip}_${s.port}`}`,
          community: 'fys' as CommunityId,
          group,
          groupOrder: order,
          sort: order * 100 + idx,
          displayName: cleanName,
          fullTitle: String(s.name || cleanName),
          ip: String(s.ip),
          port: Number(s.port) || 27015,
          region: '风云社多线',
          online: Boolean(s.online) && !s.server_offline,
          players: Number(s.real_players ?? s.players ?? 0),
          maxPlayers: Number(s.max_players ?? 64),
          bots: Number(s.bots ?? 0),
          map: String(s.map_name || ''),
          mapDisplayName: String(s.mapnamecn || ''),
          mapDifficulty: '',
          mapWorkshopId: 0,
          ping: -1
        }
      })
  } catch {
    return []
  }
}

export async function fetchCommunityServers(community: CommunityId): Promise<{
  community: CommunityId
  servers: NormalizedCommunityServer[]
  fetchedAt: string
}> {
  let servers: NormalizedCommunityServer[] = []
  if (community === 'exg') {
    servers = await fetchExgCommunityServers()
  } else if (community === 'zed') {
    servers = await fetchZedCommunityServers()
  } else if (community === 'fys') {
    servers = await fetchFysCommunityServers()
  }
  return { community, servers, fetchedAt: new Date().toISOString() }
}

export async function fetchExgOnlineStats(): Promise<ExgOnlineStatPoint[]> {
  try {
    const resp = await fetchJsonWithTimeout<{ code: number; data: ExgOnlineStatPoint[] }>(
      EXG_ONLINE_STATS_URL,
      6000
    )
    return resp && Array.isArray(resp.data) ? resp.data : []
  } catch {
    return []
  }
}

export async function fetchExgMapDict(): Promise<
  Record<string, { mapNameCN: string; difficulty: string }>
> {
  if (cachedMapDict) return cachedMapDict
  try {
    const resp = await fetchJsonWithTimeout<{ code: number; data: any[] }>(EXG_MAP_LISTS_URL, 7000)
    const dict: Record<string, { mapNameCN: string; difficulty: string }> = {}
    if (resp && Array.isArray(resp.data)) {
      for (const m of resp.data) {
        if (!m?.mapName) continue
        dict[m.mapName.toLowerCase()] = {
          mapNameCN: m.mapNameCN && m.mapNameCN !== '暂无译名' ? m.mapNameCN : '',
          difficulty: DIFFICULTY_NUM_MAP[m.difficulty] || ''
        }
      }
    }
    cachedMapDict = dict
    return dict
  } catch {
    return {}
  }
}

export function importFromExgAssistantJson(filePath?: string): any[] {
  const target = filePath || LOCAL_EXG_FALLBACK
  if (!fs.existsSync(target)) return []
  const content = fs.readFileSync(path.resolve(target), 'utf8')
  const parsed = JSON.parse(content)
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.serverList)) return parsed.serverList
  return []
}
