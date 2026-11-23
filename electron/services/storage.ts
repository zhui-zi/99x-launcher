import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export type CommunityId = 'exg' | 'zed' | 'fys'

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
  theme: 'system' | 'light' | 'dark'
  activeCommunity: CommunityId
  autoRefreshIntervalSec: number
  sortBy: 'default' | 'players_desc' | 'players_asc' | 'ping_asc' | 'difficulty'
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

const DEFAULT_SETTINGS: LauncherSettings = {
  theme: 'system',
  activeCommunity: 'exg',
  autoRefreshIntervalSec: 3,
  sortBy: 'players_desc',
  sortInGroup: true,
  viewMode: 'card',
  cs2Path: '',
  steamPath: '',
  launchMode: 'steam_connect',
  regionFlag: 'worldwide',
  extraLaunchArgs: '',
  soundVolume: 0.85,
  soundEnabled: true,
  desktopNotification: true,
  mapWatchNotifySound: true,
  closeBehavior: 'tray',
  minimizeToTray: false,
  autoJoinDefaultThresholdOffset: 1,
  autoJoinPollDelayMs: 500,
  autoJoinConcurrency: 1
}

const DEFAULT_DATA: PersistedData = {
  customServers: [],
  favorites: [],
  watchedServerIds: [],
  watchedMapKeywords: [],
  mapPlayStats: {},
  playSessions: [],
  serverHistory: {},
  settings: DEFAULT_SETTINGS
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), '99x-launcher-data.json')
}

export function loadPersistedData(): PersistedData {
  try {
    const file = getConfigPath()
    if (!fs.existsSync(file)) {
      return { ...DEFAULT_DATA, settings: { ...DEFAULT_SETTINGS } }
    }
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    return {
      customServers: Array.isArray(raw.customServers) ? raw.customServers : [],
      favorites: Array.isArray(raw.favorites) ? raw.favorites : [],
      watchedServerIds: Array.isArray(raw.watchedServerIds) ? raw.watchedServerIds : [],
      watchedMapKeywords: Array.isArray(raw.watchedMapKeywords) ? raw.watchedMapKeywords : [],
      mapPlayStats: raw.mapPlayStats && typeof raw.mapPlayStats === 'object' ? raw.mapPlayStats : {},
      playSessions: Array.isArray(raw.playSessions) ? raw.playSessions : [],
      serverHistory: raw.serverHistory && typeof raw.serverHistory === 'object' ? raw.serverHistory : {},
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) }
    }
  } catch {
    return { ...DEFAULT_DATA, settings: { ...DEFAULT_SETTINGS } }
  }
}

export function savePersistedData(data: PersistedData): void {
  try {
    const file = getConfigPath()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to save persisted data:', err)
  }
}
