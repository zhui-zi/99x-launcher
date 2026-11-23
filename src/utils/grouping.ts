import type { DifficultyLevel, ServerItem, SortMode } from '../types/server'

export interface DifficultyStyle {
  label: DifficultyLevel
  rank: number
  bg: string
  text: string
  border: string
  dot: string
  chartColor: string
}

export const DIFFICULTY_STYLES: Record<DifficultyLevel, DifficultyStyle> = {
  简单: {
    label: '简单',
    rank: 1,
    bg: 'bg-[#E6F4EA] dark:bg-[#137333]/25',
    text: 'text-[#137333] dark:text-[#81C995]',
    border: 'border-[#CEEAD6] dark:border-[#137333]/40',
    dot: '#1E8E3E',
    chartColor: '#34A853'
  },
  普通: {
    label: '普通',
    rank: 2,
    bg: 'bg-[#E8F0FE] dark:bg-[#1967D2]/25',
    text: 'text-[#1967D2] dark:text-[#8AB4F8]',
    border: 'border-[#D2E3FC] dark:border-[#1967D2]/40',
    dot: '#1A73E8',
    chartColor: '#4285F4'
  },
  困难: {
    label: '困难',
    rank: 3,
    bg: 'bg-[#FEF7E0] dark:bg-[#E37400]/25',
    text: 'text-[#B06000] dark:text-[#FDD663]',
    border: 'border-[#FEEFC3] dark:border-[#E37400]/40',
    dot: '#F9AB00',
    chartColor: '#FBBC04'
  },
  极难: {
    label: '极难',
    rank: 4,
    bg: 'bg-[#FEEFE3] dark:bg-[#D56E0C]/25',
    text: 'text-[#C26401] dark:text-[#FCAD70]',
    border: 'border-[#FDD8B5] dark:border-[#D56E0C]/40',
    dot: '#FA7B17',
    chartColor: '#FA7B17'
  },
  梦魇: {
    label: '梦魇',
    rank: 5,
    bg: 'bg-[#FCE8E6] dark:bg-[#C5221F]/25',
    text: 'text-[#C5221F] dark:text-[#F28B82]',
    border: 'border-[#FAD2CF] dark:border-[#C5221F]/40',
    dot: '#D93025',
    chartColor: '#EA4335'
  },
  史诗: {
    label: '史诗',
    rank: 6,
    bg: 'bg-[#F3E8FD] dark:bg-[#7627BB]/25',
    text: 'text-[#7627BB] dark:text-[#D7AEFB]',
    border: 'border-[#E9D2FD] dark:border-[#7627BB]/40',
    dot: '#9334E6',
    chartColor: '#A142F4'
  },
  未知: {
    label: '未知',
    rank: 0,
    bg: 'bg-[#F1F3F4] dark:bg-[#3C4043]/50',
    text: 'text-[#5F6368] dark:text-[#BDC1C6]',
    border: 'border-[#E8EAED] dark:border-[#3C4043]',
    dot: '#9AA0A6',
    chartColor: '#9AA0A6'
  }
}

export function normalizeDifficulty(raw?: string): DifficultyLevel {
  const s = (raw || '').trim()
  if (s === '简单' || s === '普通' || s === '困难' || s === '极难' || s === '梦魇' || s === '史诗') {
    return s
  }
  return '未知'
}

export function classifyExgGroup(id: string, sort: number, displayName: string): {
  group: string
  order: number
} {
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

export function sortServers(servers: ServerItem[], sortBy: SortMode): ServerItem[] {
  const copy = [...servers]
  copy.sort((a, b) => {
    // Keep online servers above offline servers
    if (a.online !== b.online) return a.online ? -1 : 1

    switch (sortBy) {
      case 'players_desc':
        if (b.players !== a.players) return b.players - a.players
        return a.sort - b.sort
      case 'players_asc':
        if (a.players !== b.players) return a.players - b.players
        return a.sort - b.sort
      case 'ping_asc': {
        const pa = a.ping > 0 ? a.ping : 9999
        const pb = b.ping > 0 ? b.ping : 9999
        if (pa !== pb) return pa - pb
        return b.players - a.players
      }
      case 'difficulty': {
        const da = DIFFICULTY_STYLES[a.mapDifficulty].rank
        const db = DIFFICULTY_STYLES[b.mapDifficulty].rank
        if (db !== da) return db - da
        return b.players - a.players
      }
      case 'default':
      default:
        return a.sort - b.sort
    }
  })
  return copy
}

export interface ServerGroupBucket {
  name: string
  order: number
  servers: ServerItem[]
  totalPlayers: number
  totalCapacity: number
  onlineCount: number
}

export function groupServers(
  servers: ServerItem[],
  sortBy: SortMode,
  sortInGroup: boolean
): ServerGroupBucket[] {
  if (!sortInGroup) {
    const sorted = sortServers(servers, sortBy)
    return [
      {
        name: '全部服务器（全局排序）',
        order: 0,
        servers: sorted,
        totalPlayers: sorted.reduce((acc, s) => acc + s.players, 0),
        totalCapacity: sorted.reduce((acc, s) => acc + s.maxPlayers, 0),
        onlineCount: sorted.filter((s) => s.online).length
      }
    ]
  }

  const map = new Map<string, ServerGroupBucket>()
  for (const s of servers) {
    let bucket = map.get(s.group)
    if (!bucket) {
      bucket = {
        name: s.group,
        order: s.groupOrder,
        servers: [],
        totalPlayers: 0,
        totalCapacity: 0,
        onlineCount: 0
      }
      map.set(s.group, bucket)
    }
    bucket.servers.push(s)
    bucket.totalPlayers += s.players
    bucket.totalCapacity += s.maxPlayers
    if (s.online) bucket.onlineCount += 1
  }

  const buckets = Array.from(map.values()).sort((a, b) => a.order - b.order)
  for (const b of buckets) {
    b.servers = sortServers(b.servers, sortBy)
  }
  return buckets
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return `${hrs}小时${rem}分`
}

export function getPingColor(ping: number): string {
  if (ping <= 0) return 'text-[#9AA0A6]'
  if (ping < 45) return 'text-[#1E8E3E] dark:text-[#81C995]'
  if (ping < 90) return 'text-[#E37400] dark:text-[#FDD663]'
  return 'text-[#D93025] dark:text-[#F28B82]'
}
