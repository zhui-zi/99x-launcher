import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Star,
  Layers,
  CheckCircle2,
  Bell,
  Globe
} from 'lucide-react'
import type {
  AutoJoinState,
  CommunityId,
  CustomServerConfig,
  DifficultyLevel,
  ExgOnlineStatPoint,
  LauncherSettings,
  MapChangeEvent,
  MapPlayRecord,
  PersistedData,
  PlaySessionLog,
  ServerHistoryPoint,
  ServerItem,
  SortMode,
  ThemeMode
} from './types/server'
import { DIFFICULTY_STYLES, groupServers, normalizeDifficulty } from './utils/grouping'
import { playSuccessSound } from './utils/sound'
import { TitleBar } from './components/TitleBar'
import { NavigationRail, type NavTab } from './components/NavigationRail'
import { ServerCard } from './components/ServerCard'
import { ServerTable } from './components/ServerTable'
import { ServerDetailDrawer } from './components/ServerDetailDrawer'
import { AutoJoinBar } from './components/AutoJoinBar'
import { AddServerModal } from './components/AddServerModal'
import { AnalyticsView } from './components/AnalyticsView'
import { MapMonitorView } from './components/MapMonitorView'
import { MapCleanerView } from './components/MapCleanerView'
import { CfgManagerView } from './components/CfgManagerView'
import { SettingsView } from './components/SettingsView'

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
  autoJoinPollDelayMs: 1500,
  autoJoinConcurrency: 1
}

const COMMUNITIES: Array<{ id: CommunityId; name: string }> = [
  { id: 'exg', name: 'EXG 社区' },
  { id: 'zed', name: 'ZED 僵尸乐园' },
  { id: 'fys', name: 'FYS 风云社' }
]

function nowTimeStr(): string {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('servers')
  const [settings, setSettings] = useState<LauncherSettings>(DEFAULT_SETTINGS)
  const [customServers, setCustomServers] = useState<CustomServerConfig[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [watchedServerIds, setWatchedServerIds] = useState<string[]>([])
  const [watchedMapKeywords, setWatchedMapKeywords] = useState<string[]>([])
  const [mapPlayStats, setMapPlayStats] = useState<Record<string, MapPlayRecord>>({})
  const [playSessions, setPlaySessions] = useState<PlaySessionLog[]>([])
  const [serverHistory, setServerHistory] = useState<Record<string, ServerHistoryPoint[]>>({})
  const [mapChangeEvents, setMapChangeEvents] = useState<MapChangeEvent[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  const [communityCache, setCommunityCache] = useState<Record<CommunityId, any[]>>({
    exg: [],
    zed: [],
    fys: []
  })
  const [a2sCache, setA2sCache] = useState<Record<string, any>>({})
  const [mapDict, setMapDict] = useState<Record<string, { mapNameCN: string; difficulty: string }>>({})
  const [onlineStats, setOnlineStats] = useState<ExgOnlineStatPoint[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [countdownSec, setCountdownSec] = useState(3)
  const [cs2Running, setCs2Running] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [hideEmpty, setHideEmpty] = useState(false)
  const [onlyJoinable, setOnlyJoinable] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Modals / Drawers
  const [inspectServerId, setInspectServerId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Auto-Join State
  const [autoJoin, setAutoJoin] = useState<AutoJoinState>({
    active: false,
    server: null,
    targetMaxPlayers: 63,
    pollDelayMs: 1500,
    concurrency: 1,
    attempts: 0,
    currentPlayers: -1,
    maxPlayers: 64,
    ping: -1,
    elapsedMs: 0,
    status: 'idle',
    logs: []
  })

  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const fetchSeqRef = useRef(0)
  const prevMapsRef = useRef<Map<string, string>>(new Map())
  const watchedIdsRef = useRef<Set<string>>(new Set())
  const watchedKeywordsRef = useRef<string[]>([])
  const lastHistorySampleRef = useRef<number>(0)

  useEffect(() => {
    watchedIdsRef.current = new Set(watchedServerIds)
  }, [watchedServerIds])

  useEffect(() => {
    watchedKeywordsRef.current = watchedMapKeywords
  }, [watchedMapKeywords])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev))
    }, 3000)
  }, [])

  // Record a map play session whenever user connects to a server
  const recordMapPlay = useCallback((server: ServerItem) => {
    const mapKey = (server.map || 'unknown').toLowerCase()
    const nowIso = new Date().toISOString()

    setMapPlayStats((prev) => {
      const existing = prev[mapKey]
      const updated: MapPlayRecord = {
        map: server.map || 'unknown',
        mapDisplayName: server.mapDisplayName || existing?.mapDisplayName || '',
        difficulty: server.mapDifficulty || existing?.difficulty || '未知',
        playCount: (existing?.playCount || 0) + 1,
        totalMinutes: (existing?.totalMinutes || 0) + 20, // estimated baseline per session
        lastPlayedAt: nowIso,
        lastServerName: server.displayName
      }
      return { ...prev, [mapKey]: updated }
    })

    setPlaySessions((prev) => [
      {
        id: `ses_${Date.now()}`,
        serverId: server.id,
        serverName: server.displayName,
        community: server.community,
        map: server.map || 'unknown',
        mapDisplayName: server.mapDisplayName || '',
        difficulty: server.mapDifficulty || '未知',
        joinedAt: nowIso,
        durationMinutes: 20
      },
      ...prev
    ].slice(0, 100))
  }, [])

  // Auto Light/Dark theme adaptation (system | light | dark)
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const useDark =
        settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      if (useDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }

    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [settings.theme])

  // Load persisted config + detect CS2 paths
  useEffect(() => {
    const init = async () => {
      if (!window.cs2Api) {
        setDataLoaded(true)
        return
      }
      const persisted = await window.cs2Api.storage.load()
      let mergedSettings = { ...DEFAULT_SETTINGS, ...(persisted?.settings || {}) }
      if (!mergedSettings.cs2Path || !mergedSettings.steamPath) {
        const detected = await window.cs2Api.game.detectPaths()
        mergedSettings = {
          ...mergedSettings,
          cs2Path: mergedSettings.cs2Path || detected.cs2Path,
          steamPath: mergedSettings.steamPath || detected.steamPath
        }
      }
      setSettings(mergedSettings)
      setCustomServers(persisted?.customServers || [])
      setFavorites(persisted?.favorites || [])
      setWatchedServerIds(persisted?.watchedServerIds || [])
      setWatchedMapKeywords(persisted?.watchedMapKeywords || [])
      setMapPlayStats(persisted?.mapPlayStats || {})
      setPlaySessions(persisted?.playSessions || [])
      setServerHistory(persisted?.serverHistory || {})
      setCountdownSec(mergedSettings.autoRefreshIntervalSec || 3)
      setDataLoaded(true)

      const [dict, stats, exgPre, zedPre, fysPre] = await Promise.all([
        window.cs2Api.exg.fetchMapDict(),
        window.cs2Api.exg.fetchOnlineStats(),
        window.cs2Api.community.fetchServers('exg'),
        window.cs2Api.community.fetchServers('zed'),
        window.cs2Api.community.fetchServers('fys')
      ])
      setMapDict(dict || {})
      setOnlineStats(stats || [])
      setCommunityCache({
        exg: exgPre?.servers || [],
        zed: zedPre?.servers || [],
        fys: fysPre?.servers || []
      })
    }
    init()
  }, [])

  // Persist changes
  useEffect(() => {
    if (!dataLoaded || !window.cs2Api) return
    const payload: PersistedData = {
      customServers,
      favorites,
      watchedServerIds,
      watchedMapKeywords,
      mapPlayStats,
      playSessions,
      serverHistory,
      settings
    }
    window.cs2Api.storage.save(payload)
  }, [
    customServers,
    favorites,
    watchedServerIds,
    watchedMapKeywords,
    mapPlayStats,
    playSessions,
    serverHistory,
    settings,
    dataLoaded
  ])

  // Refresh active community servers + A2S batch ping/status (instant community switch via fetchSeqRef!)
  const refreshAll = useCallback(async (forceCommunity?: CommunityId) => {
    if (!window.cs2Api) return
    const seq = ++fetchSeqRef.current
    const comm = forceCommunity || settingsRef.current.activeCommunity
    setIsRefreshing(true)
    try {
      const [commRes, running] = await Promise.all([
        window.cs2Api.community.fetchServers(comm),
        window.cs2Api.game.isRunning()
      ])
      if (seq !== fetchSeqRef.current) return
      setCs2Running(running)
      const list = commRes?.servers || []
      setCommunityCache((prev) => ({ ...prev, [comm]: list }))

      const targets: Array<{ ip: string; port: number }> = []
      const seen = new Set<string>()
      for (const item of list) {
        if (item?.ip && item?.port) {
          const k = `${item.ip}:${item.port}`
          if (!seen.has(k)) {
            seen.add(k)
            targets.push({ ip: item.ip, port: item.port })
          }
        }
      }
      for (const c of customServers) {
        if (c.community === comm || c.community === 'custom') {
          const k = `${c.ip}:${c.port}`
          if (!seen.has(k)) {
            seen.add(k)
            targets.push({ ip: c.ip, port: c.port })
          }
        }
      }

      if (targets.length > 0) {
        const batch = await window.cs2Api.a2s.batch(targets, 14)
        if (seq !== fetchSeqRef.current) return
        setA2sCache((prev) => ({ ...prev, ...batch }))
      }
    } finally {
      if (seq === fetchSeqRef.current) {
        setIsRefreshing(false)
        setCountdownSec(settingsRef.current.autoRefreshIntervalSec || 3)
      }
    }
  }, [customServers])

  useEffect(() => {
    if (!dataLoaded) return
    setSelectedGroup('ALL')
    refreshAll(settings.activeCommunity)
  }, [dataLoaded, settings.activeCommunity, refreshAll])

  // 3-second auto-refresh countdown timer
  useEffect(() => {
    if (settings.autoRefreshIntervalSec <= 0) return
    setCountdownSec(settings.autoRefreshIntervalSec)
    const timer = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev <= 1) {
          refreshAll()
          return settings.autoRefreshIntervalSec
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [settings.autoRefreshIntervalSec, refreshAll])

  // Subscribe to Auto-Join & Tray IPC events
  useEffect(() => {
    if (!window.cs2Api) return

    const unsubTick = window.cs2Api.autoJoin.onTick((tick) => {
      setAutoJoin((prev) => {
        if (!prev.active) return prev
        return {
          ...prev,
          attempts: tick.attempts,
          currentPlayers: tick.currentPlayers,
          maxPlayers: tick.maxPlayers > 0 ? tick.maxPlayers : prev.maxPlayers,
          ping: tick.ping,
          elapsedMs: tick.elapsedMs
        }
      })
    })

    const unsubSuccess = window.cs2Api.autoJoin.onSuccess(async (payload) => {
      const cfg = settingsRef.current
      if (cfg.soundEnabled) {
        playSuccessSound(cfg.soundVolume)
      }
      if (cfg.desktopNotification) {
        window.cs2Api?.notify.show(
          '挤服成功！正在连接服务器',
          `${payload.serverName} (${payload.currentPlayers}/${payload.maxPlayers} · ${payload.ping}ms)`
        )
      }
      showToast(`挤服成功！正在自动连接 ${payload.serverName} (${payload.currentPlayers}/${payload.maxPlayers})`)

      setAutoJoin((prev) => {
        if (prev.server) recordMapPlay(prev.server)
        return {
          ...prev,
          active: false,
          status: 'found',
          currentPlayers: payload.currentPlayers,
          ping: payload.ping,
          logs: [
            ...prev.logs.slice(-30),
            {
              time: nowTimeStr(),
              text: `发现空位 (${payload.currentPlayers}/${payload.maxPlayers})，已触发提示音并自动连接！`,
              type: 'success'
            }
          ]
        }
      })

      await window.cs2Api?.game.connect({
        ip: payload.ip,
        port: payload.port,
        launchMode: cfg.launchMode,
        regionFlag: cfg.regionFlag,
        extraLaunchArgs: cfg.extraLaunchArgs
      })
    })

    const unsubTrayStop = window.cs2Api.autoJoin.onTrayStop(() => {
      setAutoJoin((prev) => ({ ...prev, active: false, status: 'idle' }))
    })

    return () => {
      unsubTick()
      unsubSuccess()
      unsubTrayStop()
    }
  }, [showToast, recordMapPlay])

  // Merge active community + matching custom servers + live A2S data
  const allServers: ServerItem[] = useMemo(() => {
    const items: ServerItem[] = []
    const activeComm = settings.activeCommunity
    const communityRaw = communityCache[activeComm] || []

    for (const raw of communityRaw) {
      if (!raw?.ip) continue
      const addr = `${raw.ip}:${raw.port}`
      const a2s = a2sCache[addr]
      const mapName = (a2s?.online && a2s.map) || raw.map || ''
      const dictEntry = mapDict[mapName.toLowerCase()]
      const mapDisplayName = raw.mapDisplayName || dictEntry?.mapNameCN || ''
      const mapDifficulty: DifficultyLevel = normalizeDifficulty(
        raw.mapDifficulty || dictEntry?.difficulty
      )

      items.push({
        id: raw.id || addr,
        community: raw.community || activeComm,
        source: 'community',
        group: raw.group || '默认分组',
        groupOrder: raw.groupOrder ?? 10,
        sort: raw.sort ?? 9999,
        displayName: raw.displayName,
        fullTitle: (a2s?.online && a2s.name) || raw.fullTitle || raw.displayName,
        ip: raw.ip,
        port: raw.port,
        address: addr,
        region: raw.region || '节点',
        online: a2s ? Boolean(a2s.online) || Boolean(raw.online) : Boolean(raw.online),
        players: a2s?.online && typeof a2s.players === 'number' ? a2s.players : raw.players ?? 0,
        maxPlayers:
          a2s?.online && typeof a2s.maxPlayers === 'number' ? a2s.maxPlayers : raw.maxPlayers ?? 64,
        bots: a2s?.online && typeof a2s.bots === 'number' ? a2s.bots : raw.bots ?? 0,
        map: mapName,
        mapDisplayName,
        mapDifficulty,
        mapWorkshopId: raw.mapWorkshopId || 0,
        ping: a2s?.online ? a2s.ping : raw.ping ?? -1,
        vac: a2s?.vac,
        keywords: a2s?.keywords || (Array.isArray(raw.tags) ? raw.tags.join(',') : '')
      })
    }

    for (const c of customServers) {
      if (c.community !== activeComm && c.community !== 'custom') continue
      const addr = `${c.ip}:${c.port}`
      const a2s = a2sCache[addr]
      const mapName = a2s?.online ? a2s.map || '' : ''
      const dictEntry = mapDict[mapName.toLowerCase()]
      items.push({
        id: c.id,
        community: c.community,
        source: 'custom',
        group: c.group || '自定义服务器',
        groupOrder: 100,
        sort: 9000,
        displayName: c.name || a2s?.name || addr,
        fullTitle: a2s?.name || c.name || addr,
        ip: c.ip,
        port: c.port,
        address: addr,
        region: c.region || '自定义',
        online: Boolean(a2s?.online),
        players: a2s?.online ? a2s.players ?? 0 : 0,
        maxPlayers: a2s?.online ? a2s.maxPlayers ?? 0 : 0,
        bots: a2s?.online ? a2s.bots ?? 0 : 0,
        map: mapName,
        mapDisplayName: dictEntry?.mapNameCN || '',
        mapDifficulty: normalizeDifficulty(dictEntry?.difficulty),
        mapWorkshopId: 0,
        ping: a2s?.online ? a2s.ping : -1,
        vac: a2s?.vac,
        keywords: a2s?.keywords,
        notes: c.notes
      })
    }

    return items
  }, [communityCache, customServers, a2sCache, mapDict, settings.activeCommunity])

  // Map-change monitor + Per-server historical player sampling (every 60s)
  useEffect(() => {
    if (allServers.length === 0) return

    // 1. Map change monitor
    const prevMap = prevMapsRef.current
    const newEvents: MapChangeEvent[] = []
    const cfg = settingsRef.current

    for (const srv of allServers) {
      if (!srv.online || !srv.map) continue
      const lastMap = prevMap.get(srv.id)
      prevMap.set(srv.id, srv.map)

      if (!lastMap || lastMap === srv.map) continue

      const isServerWatched = watchedIdsRef.current.has(srv.id)
      const mapHaystack = `${srv.map} ${srv.mapDisplayName}`.toLowerCase()
      const matchedKeyword = watchedKeywordsRef.current.find((kw) =>
        mapHaystack.includes(kw.toLowerCase())
      )

      if (isServerWatched || matchedKeyword) {
        newEvents.push({
          id: `${srv.id}_${Date.now()}_${Math.random()}`,
          time: nowTimeStr(),
          serverId: srv.id,
          serverName: srv.displayName,
          community: srv.community,
          oldMap: lastMap,
          newMap: srv.map,
          newMapDisplayName: srv.mapDisplayName,
          difficulty: srv.mapDifficulty,
          reason: matchedKeyword ? 'keyword_match' : 'server_watch',
          matchedKeyword
        })

        const mapLabel = srv.mapDisplayName ? `${srv.mapDisplayName} (${srv.map})` : srv.map
        if (cfg.desktopNotification) {
          window.cs2Api?.notify.show(
            matchedKeyword ? `神图换图提醒（命中：${matchedKeyword}）` : '服务器换图提醒',
            `${srv.displayName} 已切换至 ${mapLabel} [${srv.mapDifficulty}]`
          )
        }
      }
    }

    if (newEvents.length > 0) {
      if (cfg.mapWatchNotifySound) {
        playSuccessSound(cfg.soundVolume)
      }
      setMapChangeEvents((prev) => [...newEvents, ...prev].slice(0, 60))
      showToast(`换图提醒：${newEvents[0].serverName} → ${newEvents[0].newMapDisplayName || newEvents[0].newMap}`)
    }

    // 2. Sample per-server player history at most once every 45 seconds
    const now = Date.now()
    if (now - lastHistorySampleRef.current >= 45000) {
      lastHistorySampleRef.current = now
      setServerHistory((prev) => {
        const next = { ...prev }
        for (const srv of allServers) {
          if (!srv.online) continue
          const arr = next[srv.id] ? [...next[srv.id]] : []
          arr.push({ timestamp: now, players: srv.players, maxPlayers: srv.maxPlayers })
          next[srv.id] = arr.slice(-80)
        }
        return next
      })
    }
  }, [allServers, showToast])

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])
  const watchedSet = useMemo(() => new Set(watchedServerIds), [watchedServerIds])

  const availableGroups = useMemo(() => {
    const map = new Map<string, { order: number; count: number; players: number }>()
    for (const s of allServers) {
      const prev = map.get(s.group) || { order: s.groupOrder, count: 0, players: 0 }
      prev.count += 1
      prev.players += s.players
      map.set(s.group, prev)
    }
    return Array.from(map.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => a.order - b.order)
  }, [allServers])

  const filteredServers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allServers.filter((s) => {
      if (selectedGroup === 'FAV' && !favoriteSet.has(s.id)) return false
      if (selectedGroup === 'WATCH' && !watchedSet.has(s.id)) return false
      if (
        selectedGroup !== 'ALL' &&
        selectedGroup !== 'FAV' &&
        selectedGroup !== 'WATCH' &&
        s.group !== selectedGroup
      ) {
        return false
      }
      if (selectedDifficulty !== 'ALL' && s.mapDifficulty !== selectedDifficulty) return false
      if (hideEmpty && s.players === 0) return false
      if (onlyJoinable && (!s.online || (s.maxPlayers > 0 && s.players >= s.maxPlayers))) {
        return false
      }
      if (q) {
        const hay = `${s.displayName} ${s.fullTitle} ${s.map} ${s.mapDisplayName} ${s.address} ${s.group} ${s.mapDifficulty}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [allServers, searchQuery, selectedGroup, selectedDifficulty, hideEmpty, onlyJoinable, favoriteSet, watchedSet])

  const groupedBuckets = useMemo(
    () => groupServers(filteredServers, settings.sortBy, settings.sortInGroup),
    [filteredServers, settings.sortBy, settings.sortInGroup]
  )

  const totalOnlinePlayers = useMemo(
    () => allServers.reduce((acc, s) => acc + (s.online ? s.players : 0), 0),
    [allServers]
  )
  const totalOnlineServers = useMemo(
    () => allServers.filter((s) => s.online).length,
    [allServers]
  )

  const inspectedServer = useMemo(
    () => allServers.find((s) => s.id === inspectServerId) || null,
    [allServers, inspectServerId]
  )

  // Actions
  const handlePatchSettings = (patch: Partial<LauncherSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const handleCycleTheme = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(settings.theme) + 1) % order.length]
    handlePatchSettings({ theme: next })
    showToast(
      next === 'system' ? '主题已切换为：跟随系统' : next === 'light' ? '主题已切换为：浅色模式' : '主题已切换为：深色模式'
    )
  }

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleToggleWatch = (id: string) => {
    setWatchedServerIds((prev) => {
      const exists = prev.includes(id)
      showToast(exists ? '已取消该服务器的换图监控' : '已开启该服务器的换图桌面提醒')
      return exists ? prev.filter((x) => x !== id) : [...prev, id]
    })
  }

  const handleJoinServer = async (server: ServerItem) => {
    recordMapPlay(server)
    showToast(`正在通过 Steam 连接 ${server.displayName}...`)
    await window.cs2Api?.game.connect({
      ip: server.ip,
      port: server.port,
      launchMode: settings.launchMode,
      regionFlag: settings.regionFlag,
      extraLaunchArgs: settings.extraLaunchArgs
    })
  }

  const handleStartAutoJoin = async (server: ServerItem, customThreshold?: number) => {
    if (autoJoin.active && autoJoin.server?.id === server.id && customThreshold === undefined) {
      await handleStopAutoJoin()
      return
    }
    const maxP = server.maxPlayers > 0 ? server.maxPlayers : 64
    const threshold =
      customThreshold !== undefined
        ? Math.max(0, Math.min(maxP, customThreshold))
        : Math.max(0, maxP - settings.autoJoinDefaultThresholdOffset)

    setAutoJoin({
      active: true,
      server,
      targetMaxPlayers: threshold,
      pollDelayMs: settings.autoJoinPollDelayMs,
      concurrency: settings.autoJoinConcurrency,
      attempts: 0,
      currentPlayers: server.players,
      maxPlayers: maxP,
      ping: server.ping,
      elapsedMs: 0,
      status: 'polling',
      logs: [
        {
          time: nowTimeStr(),
          text: `开始自动挤服 ${server.displayName} (${server.address})，目标人数 ≤ ${threshold}`,
          type: 'info'
        }
      ]
    })

    await window.cs2Api?.autoJoin.start({
      serverId: server.id,
      serverName: server.displayName,
      ip: server.ip,
      port: server.port,
      targetMaxPlayers: threshold,
      pollDelayMs: settings.autoJoinPollDelayMs,
      concurrency: settings.autoJoinConcurrency
    })
  }

  const handleStopAutoJoin = async () => {
    await window.cs2Api?.autoJoin.stop()
    setAutoJoin((prev) => ({ ...prev, active: false, status: 'idle' }))
    showToast('已停止自动挤服')
  }

  const handleCopyAddress = (server: ServerItem) => {
    navigator.clipboard.writeText(`connect ${server.address}`)
    showToast(`已复制：connect ${server.address}`)
  }

  const handleAddCustomServer = (srv: CustomServerConfig) => {
    setCustomServers((prev) => [srv, ...prev])
    showToast(`已添加自定义服务器：${srv.name}`)
  }

  const handleDeleteCustomServer = (id: string) => {
    setCustomServers((prev) => prev.filter((c) => c.id !== id))
    showToast('已删除自定义服务器')
  }

  const handleImportExgJson = async (): Promise<number> => {
    if (!window.cs2Api) return 0
    const res = await window.cs2Api.exg.importLocalJson()
    if (res.canceled || !res.servers.length) return 0
    const existing = new Set(customServers.map((c) => `${c.ip}:${c.port}`))
    const toAdd: CustomServerConfig[] = []
    for (const item of res.servers) {
      const ip = item?.Server?.Ip
      const port = item?.Server?.Port
      if (!ip || !port) continue
      const addr = `${ip}:${port}`
      if (existing.has(addr)) continue
      existing.add(addr)
      toAdd.push({
        id: `import_${Date.now()}_${toAdd.length}`,
        community: 'custom',
        name: item?.Server?.DisplayName || addr,
        ip,
        port,
        group: '导入的服务器',
        region: item?.Server?.Region || '导入',
        createdAt: new Date().toISOString()
      })
    }
    if (toAdd.length > 0) {
      setCustomServers((prev) => [...toAdd, ...prev])
    }
    return toAdd.length
  }

  const toggleGroupCollapse = (name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F3F3F3] dark:bg-[#202020] text-[#1A1A1A] dark:text-[#F3F3F3]">
      <TitleBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isRefreshing={isRefreshing}
        countdownSec={countdownSec}
        autoRefreshSec={settings.autoRefreshIntervalSec}
        onRefresh={() => refreshAll()}
        onAddServer={() => setAddModalOpen(true)}
        theme={settings.theme}
        onCycleTheme={handleCycleTheme}
        cs2Running={cs2Running}
        activeCommunity={settings.activeCommunity}
        totalOnlinePlayers={totalOnlinePlayers}
        totalOnlineServers={totalOnlineServers}
      />

      <div className="flex-1 flex min-h-0">
        <NavigationRail
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeCommunity={settings.activeCommunity}
          autoJoinActive={autoJoin.active}
          watchedCount={watchedServerIds.length + watchedMapKeywords.length}
        />

        {/* WinUI 3 Rounded Content Surface */}
        <main className="flex-1 overflow-y-auto bg-[#F9F9F9] dark:bg-[#272727] rounded-tl-lg border-t border-l border-black/[0.05] dark:border-white/[0.06] relative">
          {activeTab === 'servers' && (
            <div className={`p-5 space-y-4 max-w-[1440px] mx-auto ${autoJoin.active ? 'pb-28' : 'pb-10'}`}>
              {/* Community Switcher (WinUI 3 Pivot / Segmented Control) */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06]">
                  {COMMUNITIES.map((c) => {
                    const active = settings.activeCommunity === c.id
                    const count = (communityCache[c.id] || []).length
                    return (
                      <button
                        key={c.id}
                        onClick={() => handlePatchSettings({ activeCommunity: c.id })}
                        className={`h-8 px-4 rounded-md text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-white dark:bg-[#383838] text-[#0067C0] dark:text-[#60CDFF] shadow-sm'
                            : 'text-[#5D5D5D] dark:text-[#B0B0B0] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3]'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{c.name}</span>
                        {count > 0 && (
                          <span className="text-[11px] font-mono opacity-70">{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Group Filter Strip */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedGroup('ALL')}
                  className={`h-7 px-3 rounded-md text-[12px] font-medium border transition-colors ${
                    selectedGroup === 'ALL'
                      ? 'bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] border-transparent'
                      : 'fluent-btn-standard'
                  }`}
                >
                  全部 ({allServers.length})
                </button>
                <button
                  onClick={() => setSelectedGroup('FAV')}
                  className={`h-7 px-3 rounded-md text-[12px] font-medium inline-flex items-center gap-1 border transition-colors ${
                    selectedGroup === 'FAV'
                      ? 'bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] border-transparent'
                      : 'fluent-btn-standard'
                  }`}
                >
                  <Star className="w-3 h-3" /> 收藏 ({favorites.length})
                </button>
                <button
                  onClick={() => setSelectedGroup('WATCH')}
                  className={`h-7 px-3 rounded-md text-[12px] font-medium inline-flex items-center gap-1 border transition-colors ${
                    selectedGroup === 'WATCH'
                      ? 'bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] border-transparent'
                      : 'fluent-btn-standard'
                  }`}
                >
                  <Bell className="w-3 h-3" /> 监控中 ({watchedServerIds.length})
                </button>
                {availableGroups.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGroup(g.name)}
                    className={`h-7 px-3 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 border transition-colors ${
                      selectedGroup === g.name
                        ? 'bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] border-transparent'
                        : 'fluent-btn-standard'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="text-[11px] opacity-75 font-mono">{g.players}人</span>
                  </button>
                ))}
              </div>

              {/* Fluent CommandBar */}
              <div className="fluent-card px-3.5 py-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 text-[12px]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#5D5D5D]" />
                    <select
                      value={settings.sortBy}
                      onChange={(e) => handlePatchSettings({ sortBy: e.target.value as SortMode })}
                      className="h-7 px-2 fluent-input text-[12px]"
                    >
                      <option value="players_desc">人数从多到少</option>
                      <option value="players_asc">人数从少到多</option>
                      <option value="ping_asc">延迟从低到高</option>
                      <option value="difficulty">地图难度优先</option>
                      <option value="default">社区默认排序</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handlePatchSettings({ sortInGroup: !settings.sortInGroup })}
                    className={`h-7 px-2.5 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 border transition-colors ${
                      settings.sortInGroup
                        ? 'bg-[#0067C0]/10 border-[#0067C0]/30 text-[#0067C0] dark:bg-[#60CDFF]/15 dark:border-[#60CDFF]/30 dark:text-[#60CDFF]'
                        : 'fluent-btn-standard'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {settings.sortInGroup ? '分组展示' : '全局混排'}
                  </button>

                  <div className="inline-flex items-center gap-1.5 text-[12px]">
                    <Filter className="w-3.5 h-3.5 text-[#5D5D5D]" />
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="h-7 px-2 fluent-input text-[12px]"
                    >
                      <option value="ALL">全部难度</option>
                      {Object.keys(DIFFICULTY_STYLES).map((d) => (
                        <option key={d} value={d}>
                          难度：{d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-1.5 text-[12px] text-[#5D5D5D] dark:text-[#B0B0B0] cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={hideEmpty}
                      onChange={(e) => setHideEmpty(e.target.checked)}
                      className="accent-[#0067C0]"
                    />
                    隐藏空服
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[12px] text-[#5D5D5D] dark:text-[#B0B0B0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyJoinable}
                      onChange={(e) => setOnlyJoinable(e.target.checked)}
                      className="accent-[#0067C0]"
                    />
                    仅看有空位
                  </label>
                </div>

                <div className="flex items-center rounded-md bg-black/[0.04] dark:bg-white/[0.05] p-0.5">
                  <button
                    onClick={() => handlePatchSettings({ viewMode: 'card' })}
                    className={`h-6 px-2.5 rounded text-[12px] inline-flex items-center gap-1 transition-colors ${
                      settings.viewMode === 'card'
                        ? 'bg-white dark:bg-[#383838] text-[#0067C0] dark:text-[#60CDFF] shadow-sm font-medium'
                        : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> 卡片
                  </button>
                  <button
                    onClick={() => handlePatchSettings({ viewMode: 'table' })}
                    className={`h-6 px-2.5 rounded text-[12px] inline-flex items-center gap-1 transition-colors ${
                      settings.viewMode === 'table'
                        ? 'bg-white dark:bg-[#383838] text-[#0067C0] dark:text-[#60CDFF] shadow-sm font-medium'
                        : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> 列表
                  </button>
                </div>
              </div>

              {/* Server Groups */}
              {groupedBuckets.length === 0 ? (
                <div className="fluent-card py-16 text-center text-[13px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                  未找到符合筛选条件的服务器，试试清空搜索词或添加自定义服务器
                </div>
              ) : (
                <div className="space-y-5">
                  {groupedBuckets.map((bucket) => {
                    const collapsed = collapsedGroups.has(bucket.name)
                    return (
                      <section key={bucket.name} className="space-y-2.5">
                        <button
                          onClick={() => toggleGroupCollapse(bucket.name)}
                          className="flex items-center gap-2 text-left group"
                        >
                          {collapsed ? (
                            <ChevronRight className="w-4 h-4 text-[#5D5D5D]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#5D5D5D]" />
                          )}
                          <h2 className="text-[14px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
                            {bucket.name}
                          </h2>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.07] text-[#5D5D5D] dark:text-[#B0B0B0] font-mono">
                            {bucket.onlineCount}/{bucket.servers.length}
                          </span>
                          <span className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0] font-mono">
                            · {bucket.totalPlayers} / {bucket.totalCapacity} 人
                          </span>
                        </button>

                        {!collapsed &&
                          (settings.viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {bucket.servers.map((server) => (
                                <ServerCard
                                  key={server.id}
                                  server={server}
                                  isFavorite={favoriteSet.has(server.id)}
                                  isWatched={watchedSet.has(server.id)}
                                  isAutoJoining={
                                    autoJoin.active && autoJoin.server?.id === server.id
                                  }
                                  onToggleFavorite={handleToggleFavorite}
                                  onToggleWatch={handleToggleWatch}
                                  onJoin={handleJoinServer}
                                  onAutoJoin={(s) => handleStartAutoJoin(s)}
                                  onInspect={(s) => setInspectServerId(s.id)}
                                  onCopyAddress={handleCopyAddress}
                                  onDeleteCustom={handleDeleteCustomServer}
                                />
                              ))}
                            </div>
                          ) : (
                            <ServerTable
                              servers={bucket.servers}
                              favorites={favoriteSet}
                              watched={watchedSet}
                              autoJoinServerId={autoJoin.active ? autoJoin.server?.id || null : null}
                              onToggleFavorite={handleToggleFavorite}
                              onToggleWatch={handleToggleWatch}
                              onJoin={handleJoinServer}
                              onAutoJoin={(s) => handleStartAutoJoin(s)}
                              onInspect={(s) => setInspectServerId(s.id)}
                              onCopyAddress={handleCopyAddress}
                              onDeleteCustom={handleDeleteCustomServer}
                            />
                          ))}
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitor' && (
            <MapMonitorView
              servers={allServers}
              watchedServerIds={watchedServerIds}
              watchedKeywords={watchedMapKeywords}
              events={mapChangeEvents}
              onToggleWatchServer={handleToggleWatch}
              onAddKeyword={(kw) => {
                if (!watchedMapKeywords.includes(kw)) {
                  setWatchedMapKeywords((prev) => [...prev, kw])
                  showToast(`已添加地图关键词监控：${kw}`)
                }
              }}
              onRemoveKeyword={(kw) =>
                setWatchedMapKeywords((prev) => prev.filter((k) => k !== kw))
              }
              onClearEvents={() => setMapChangeEvents([])}
              onJoinServer={handleJoinServer}
              onAutoJoinServer={(s) => handleStartAutoJoin(s)}
              onTestNotify={() => {
                if (settings.mapWatchNotifySound) playSuccessSound(settings.soundVolume)
                window.cs2Api?.notify.show(
                  '99x launcher 换图测试',
                  '换图监控桌面通知与提示音工作正常！'
                )
                showToast('已发送测试桌面通知')
              }}
            />
          )}

          {activeTab === 'cfg' && (
            <CfgManagerView
              cs2Path={settings.cs2Path}
              onPickCs2Path={async () => {
                const dir = await window.cs2Api?.game.pickDirectory(
                  '选择 Counter-Strike Global Offensive 安装目录'
                )
                if (dir) handlePatchSettings({ cs2Path: dir })
              }}
            />
          )}

          {activeTab === 'cleaner' && (
            <MapCleanerView
              cs2Path={settings.cs2Path}
              mapDict={mapDict}
              onPickCs2Path={async () => {
                const dir = await window.cs2Api?.game.pickDirectory(
                  '选择 Counter-Strike Global Offensive 安装目录'
                )
                if (dir) handlePatchSettings({ cs2Path: dir })
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              servers={allServers}
              onlineStats={onlineStats}
              mapPlayStats={mapPlayStats}
              playSessions={playSessions}
              serverHistory={serverHistory}
              onInspectServer={(s) => setInspectServerId(s.id)}
              onJoinServer={handleJoinServer}
              onClearPlayStats={() => {
                setMapPlayStats({})
                setPlaySessions([])
                showToast('已清空个人地图游玩统计')
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onChange={handlePatchSettings}
              onAutoDetectPaths={async () => {
                if (!window.cs2Api) return
                const detected = await window.cs2Api.game.detectPaths()
                handlePatchSettings({
                  cs2Path: detected.cs2Path || settings.cs2Path,
                  steamPath: detected.steamPath || settings.steamPath
                })
              }}
              onImportExgJson={handleImportExgJson}
            />
          )}
        </main>
      </div>

      {/* Floating Auto-Join Bar */}
      <AutoJoinBar
        state={autoJoin}
        onStop={handleStopAutoJoin}
        onUpdateThreshold={(t) => {
          if (autoJoin.server) handleStartAutoJoin(autoJoin.server, t)
        }}
        onTestSound={() => playSuccessSound(settings.soundVolume)}
      />

      {/* Server Detail Slide-over Drawer */}
      <ServerDetailDrawer
        server={inspectedServer}
        onClose={() => setInspectServerId(null)}
        onJoin={handleJoinServer}
        onAutoJoin={(s) => handleStartAutoJoin(s)}
        onCopyAddress={handleCopyAddress}
      />

      {/* Add Custom Server Modal */}
      <AddServerModal
        open={addModalOpen}
        activeCommunity={settings.activeCommunity}
        existingGroups={availableGroups.map((g) => g.name)}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddCustomServer}
      />

      {/* Fluent 2 TeachingTip / Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#2C2C2C] dark:bg-[#F3F3F3] text-white dark:text-[#1A1A1A] px-3.5 py-2 text-[12.5px] shadow-fluent-flyout border border-white/10 dark:border-black/10 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6CCB5F] dark:text-[#0F7B0F] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}

export default App
