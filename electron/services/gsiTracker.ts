import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import type { BrowserWindow } from 'electron'

export const GSI_PORT = 49970
export const GSI_CFG_FILENAME = 'gamestate_integration_99xlauncher.cfg'

export interface GsiLiveState {
  connected: boolean
  configInstalled: boolean
  configPath: string
  inGame: boolean
  map: string
  mapPhase: string
  roundNumber: number
  roundPhase: string
  lastEventAt: number
}

export interface GsiPlayEvent {
  type: 'map_start' | 'round_increment' | 'heartbeat' | 'map_end'
  map: string
  mapPhase: string
  roundNumber: number
  roundPhase: string
  timestamp: number
}

let server: http.Server | null = null
let heartbeatTimer: NodeJS.Timeout | null = null
let windowGetter: (() => BrowserWindow | null) | null = null

let currentState: GsiLiveState = {
  connected: false,
  configInstalled: false,
  configPath: '',
  inGame: false,
  map: '',
  mapPhase: '',
  roundNumber: 0,
  roundPhase: '',
  lastEventAt: 0
}

let lastTrackedMap = ''
let lastTrackedRound = -1
let lastTrackedRoundPhase = ''
let lastTrackedMapPhase = ''

function emitState() {
  const win = windowGetter?.()
  if (win && !win.isDestroyed()) {
    win.webContents.send('gsi:state', { ...currentState })
  }
}

function emitEvent(ev: GsiPlayEvent) {
  const win = windowGetter?.()
  if (win && !win.isDestroyed()) {
    win.webContents.send('gsi:event', ev)
  }
}

export function getGsiConfigPath(cs2Path: string): string {
  if (!cs2Path) return ''
  return path.join(cs2Path, 'game', 'csgo', 'cfg', GSI_CFG_FILENAME)
}

export function checkGsiConfigInstalled(cs2Path: string): { installed: boolean; filePath: string } {
  const filePath = getGsiConfigPath(cs2Path)
  const installed = Boolean(filePath && fs.existsSync(filePath))
  currentState.configInstalled = installed
  currentState.configPath = filePath
  return { installed, filePath }
}

export function installGsiConfig(cs2Path: string): {
  success: boolean
  filePath: string
  error?: string
} {
  try {
    if (!cs2Path) {
      return { success: false, filePath: '', error: '尚未配置 CS2 安装目录' }
    }
    const cfgDir = path.join(cs2Path, 'game', 'csgo', 'cfg')
    if (!fs.existsSync(cfgDir)) {
      return { success: false, filePath: '', error: '未找到 game/csgo/cfg 目录' }
    }
    const filePath = path.join(cfgDir, GSI_CFG_FILENAME)
    const content = [
      '"99x launcher Game State Integration"',
      '{',
      `  "uri" "http://127.0.0.1:${GSI_PORT}/gsi"`,
      '  "timeout" "5.0"',
      '  "buffer" "0.2"',
      '  "throttle" "0.5"',
      '  "heartbeat" "15.0"',
      '  "data"',
      '  {',
      '    "provider" "1"',
      '    "map" "1"',
      '    "round" "1"',
      '  }',
      '}',
      ''
    ].join('\n')

    fs.writeFileSync(filePath, content, 'utf8')
    currentState.configInstalled = true
    currentState.configPath = filePath
    emitState()
    return { success: true, filePath }
  } catch (err: any) {
    return { success: false, filePath: '', error: err?.message || '写入 GSI 配置文件失败' }
  }
}

function handleGsiPayload(payload: any) {
  const now = Date.now()
  const rawMap = typeof payload?.map?.name === 'string' ? payload.map.name.trim() : ''
  // Normalize workshop paths like "workshop/123456789/ze_example" -> "ze_example"
  const mapName = rawMap.includes('/') ? rawMap.split('/').pop() || rawMap : rawMap
  const mapPhase = typeof payload?.map?.phase === 'string' ? payload.map.phase : ''
  const roundNumber = typeof payload?.map?.round === 'number' ? payload.map.round : 0
  const roundPhase = typeof payload?.round?.phase === 'string' ? payload.round.phase : ''

  const inGame = Boolean(mapName && mapName !== '<empty>')

  currentState = {
    ...currentState,
    connected: true,
    inGame,
    map: inGame ? mapName : '',
    mapPhase,
    roundNumber,
    roundPhase,
    lastEventAt: now
  }

  if (inGame) {
    const mapChanged = mapName.toLowerCase() !== lastTrackedMap.toLowerCase()
    const matchRestarted =
      !mapChanged &&
      lastTrackedMapPhase === 'gameover' &&
      (mapPhase === 'live' || mapPhase === 'warmup')

    if (mapChanged || matchRestarted) {
      if (lastTrackedMap) {
        emitEvent({
          type: 'map_end',
          map: lastTrackedMap,
          mapPhase: lastTrackedMapPhase,
          roundNumber: lastTrackedRound > 0 ? lastTrackedRound : 0,
          roundPhase: lastTrackedRoundPhase,
          timestamp: now
        })
      }
      lastTrackedMap = mapName
      lastTrackedRound = roundNumber
      lastTrackedRoundPhase = roundPhase
      lastTrackedMapPhase = mapPhase
      emitEvent({
        type: 'map_start',
        map: mapName,
        mapPhase,
        roundNumber,
        roundPhase,
        timestamp: now
      })
    } else {
      // Detect round progression on the same map:
      // 1) map.round increased (standard CS2 round counter)
      // 2) round.phase transitioned into 'live' from 'freezetime' or 'over' (ZE servers that reset round counter or use endless rounds)
      const roundAdvanced =
        (roundNumber > lastTrackedRound && lastTrackedRound >= 0) ||
        (roundPhase === 'live' &&
          (lastTrackedRoundPhase === 'freezetime' || lastTrackedRoundPhase === 'over'))

      if (roundAdvanced) {
        emitEvent({
          type: 'round_increment',
          map: mapName,
          mapPhase,
          roundNumber,
          roundPhase,
          timestamp: now
        })
      } else {
        emitEvent({
          type: 'heartbeat',
          map: mapName,
          mapPhase,
          roundNumber,
          roundPhase,
          timestamp: now
        })
      }
      lastTrackedRound = roundNumber
      lastTrackedRoundPhase = roundPhase
      lastTrackedMapPhase = mapPhase
    }
  } else if (lastTrackedMap) {
    // Player returned to main menu
    emitEvent({
      type: 'map_end',
      map: lastTrackedMap,
      mapPhase: lastTrackedMapPhase,
      roundNumber: lastTrackedRound > 0 ? lastTrackedRound : 0,
      roundPhase: lastTrackedRoundPhase,
      timestamp: now
    })
    lastTrackedMap = ''
    lastTrackedRound = -1
    lastTrackedRoundPhase = ''
    lastTrackedMapPhase = ''
  }

  emitState()
}

export function startGsiServer(getWin: () => BrowserWindow | null): void {
  windowGetter = getWin
  if (server) return

  server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('99x launcher GSI listener active')
      return
    }
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 512_000) req.destroy()
    })
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
      try {
        const parsed = JSON.parse(body)
        handleGsiPayload(parsed)
      } catch {
        // ignore malformed payloads
      }
    })
  })

  server.on('error', (err) => {
    console.warn('[GSI] Failed to bind local listener:', err.message)
  })

  server.listen(GSI_PORT, '127.0.0.1')

  // Mark disconnected if no GSI heartbeat arrives for 45 seconds (e.g. CS2 exited)
  heartbeatTimer = setInterval(() => {
    if (!currentState.connected) return
    if (Date.now() - currentState.lastEventAt > 45_000) {
      if (lastTrackedMap) {
        emitEvent({
          type: 'map_end',
          map: lastTrackedMap,
          mapPhase: lastTrackedMapPhase,
          roundNumber: lastTrackedRound > 0 ? lastTrackedRound : 0,
          roundPhase: lastTrackedRoundPhase,
          timestamp: Date.now()
        })
        lastTrackedMap = ''
        lastTrackedRound = -1
        lastTrackedRoundPhase = ''
        lastTrackedMapPhase = ''
      }
      currentState = {
        ...currentState,
        connected: false,
        inGame: false,
        map: '',
        mapPhase: '',
        roundNumber: 0,
        roundPhase: ''
      }
      emitState()
    }
  }, 10_000)
}

export function stopGsiServer(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (server) {
    server.close()
    server = null
  }
}

export function getGsiState(): GsiLiveState {
  return { ...currentState }
}
