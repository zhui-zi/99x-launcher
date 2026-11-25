export type CommunityId = 'exg' | 'zed' | 'fys'
export type ThemeMode = 'system' | 'light' | 'dark'
export type SortMode = 'default' | 'players_desc' | 'players_asc' | 'ping_asc' | 'difficulty'
export type DifficultyLevel = '简单' | '普通' | '困难' | '极难' | '梦魇' | '史诗' | '未知'

export interface CustomServerConfig {
  id: string
  community: CommunityId | 'custom'
  name: string
  ip: string
  port: number
  group: string
  region?: string
  notes?: string
  createdAt: string
}

export interface MapPlayRecord {
  map: string
  mapDisplayName: string
  difficulty: string
  playCount: number
  totalMinutes: number
  lastPlayedAt: string
  lastServerName: string
}

export interface PlaySessionLog {
  id: string
  serverId: string
  serverName: string
  community: CommunityId | 'custom'
  map: string
  mapDisplayName: string
  difficulty: string
  joinedAt: string
  durationMinutes: number
}

export interface ServerHistoryPoint {
  timestamp: number
  players: number
  maxPlayers: number
}

export interface LauncherSettings {
  theme: ThemeMode
  activeCommunity: CommunityId
  autoRefreshIntervalSec: number
  sortBy: SortMode
  sortInGroup: boolean
  viewMode: 'card' | 'table'
  cs2Path: string
  steamPath: string
  launchMode: 'steam_connect' | 'steam_rungameid'
  regionFlag: 'worldwide' | 'perfectworld' | 'none'
  extraLaunchArgs: string
  soundVolume: number
  soundEnabled: boolean
  desktopNotification: boolean
  mapWatchNotifySound: boolean
  closeBehavior: 'tray' | 'exit'
  minimizeToTray: boolean
  autoJoinDefaultThresholdOffset: number
  autoJoinPollDelayMs: number
  autoJoinConcurrency: number
}

export interface PersistedData {
  customServers: CustomServerConfig[]
  favorites: string[]
  watchedServerIds: string[]
  watchedMapKeywords: string[]
  mapPlayStats: Record<string, MapPlayRecord>
  playSessions: PlaySessionLog[]
  serverHistory: Record<string, ServerHistoryPoint[]>
  settings: LauncherSettings
}

export interface ServerItem {
  id: string
  community: CommunityId | 'custom'
  source: 'community' | 'custom'
  group: string
  groupOrder: number
  sort: number
  displayName: string
  fullTitle: string
  ip: string
  port: number
  address: string
  region: string
  online: boolean
  players: number
  maxPlayers: number
  bots: number
  map: string
  mapDisplayName: string
  mapDifficulty: DifficultyLevel
  mapWorkshopId: number
  ping: number
  vac?: boolean
  keywords?: string
  notes?: string
}

export interface MapChangeEvent {
  id: string
  time: string
  serverId: string
  serverName: string
  community: CommunityId | 'custom'
  oldMap: string
  newMap: string
  newMapDisplayName: string
  difficulty: DifficultyLevel
  reason: 'server_watch' | 'keyword_match'
  matchedKeyword?: string
}

export interface ExgOnlineStatPoint {
  timestamp: number
  totalPlayers: number
  onlineServers: number
}

export interface A2SPlayer {
  index: number
  name: string
  score: number
  duration: number
}

export interface AutoJoinTask {
  server: ServerItem
  targetMaxPlayers: number
  pollDelayMs: number
  concurrency: number
  attempts: number
  currentPlayers: number
  maxPlayers: number
  ping: number
  elapsedMs: number
}

export interface AutoJoinState {
  tasks: Record<string, AutoJoinTask>
  logs: Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>
}

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

export interface CfgFileInfo {
  name: string
  filePath: string
  sizeBytes: number
  mtimeMs: number
}

export interface UpdateCheckResult {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  releaseUrl: string
  downloadUrl: string
  releaseNotes: string
  publishedAt: string
  error?: string
}

export interface Cs2Api {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<boolean>
    close: () => Promise<void>
    hideToTray: () => Promise<void>
    quit: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  storage: {
    load: () => Promise<PersistedData>
    save: (data: PersistedData) => Promise<{ success: boolean }>
  }
  community: {
    fetchServers: (community: CommunityId) => Promise<{
      community: CommunityId
      servers: any[]
      fetchedAt: string
    }>
  }
  exg: {
    fetchOnlineStats: () => Promise<ExgOnlineStatPoint[]>
    fetchMapDict: () => Promise<Record<string, { mapNameCN: string; difficulty: string }>>
    importLocalJson: () => Promise<{ canceled: boolean; servers: any[] }>
  }
  a2s: {
    info: (ip: string, port: number) => Promise<any>
    players: (ip: string, port: number) => Promise<{ online: boolean; players: A2SPlayer[]; error?: string }>
    batch: (targets: Array<{ ip: string; port: number }>, concurrency?: number) => Promise<Record<string, any>>
  }
  autoJoin: {
    start: (options: {
      serverId: string
      serverName: string
      ip: string
      port: number
      targetMaxPlayers: number
      pollDelayMs: number
      concurrency: number
    }) => Promise<{ started: boolean; sessionId: number; activeCount: number }>
    stop: (serverId?: string) => Promise<{ stopped: boolean; activeCount: number }>
    onTick: (cb: (payload: any) => void) => () => void
    onSuccess: (cb: (payload: any) => void) => () => void
    onTrayStop: (cb: () => void) => () => void
  }
  game: {
    detectPaths: () => Promise<{ cs2Path: string; steamPath: string }>
    isRunning: () => Promise<boolean>
    connect: (params: {
      ip: string
      port: number
      launchMode: 'steam_connect' | 'steam_rungameid'
      regionFlag: 'worldwide' | 'perfectworld' | 'none'
      extraLaunchArgs?: string
    }) => Promise<{ success: boolean; url: string; error?: string }>
    pickDirectory: (title: string) => Promise<string>
  }
  maps: {
    scan: (cs2Path: string) => Promise<MapScanResult>
    delete: (paths: string[], moveToTrash: boolean) => Promise<{
      deletedCount: number
      freedBytes: number
      errors: string[]
    }>
    openFolder: (targetPath: string) => Promise<string>
  }
  cfg: {
    list: (cs2Path: string) => Promise<{ cfgDir: string; files: CfgFileInfo[] }>
    read: (cs2Path: string, fileName: string) => Promise<{ exists: boolean; filePath: string; content: string }>
    write: (cs2Path: string, fileName: string, content: string) => Promise<{
      success: boolean
      filePath?: string
      error?: string
    }>
    readCs2Keys: (steamPath: string) => Promise<{
      found: boolean
      filePath: string
      bindings: Record<string, string>
    }>
  }
  app: {
    getVersion: () => Promise<string>
    checkUpdate: () => Promise<UpdateCheckResult>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  notify: {
    show: (title: string, body: string) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    cs2Api?: Cs2Api
  }
}
