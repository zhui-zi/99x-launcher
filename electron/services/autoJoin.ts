import type { BrowserWindow } from 'electron'
import { queryA2SInfo } from './a2sQuery'

export interface AutoJoinOptions {
  serverId: string
  serverName: string
  ip: string
  port: number
  targetMaxPlayers: number // trigger join when currentPlayers <= targetMaxPlayers
  pollDelayMs: number
  concurrency: number
}

export interface AutoJoinTickPayload {
  serverId: string
  attempts: number
  currentPlayers: number
  maxPlayers: number
  ping: number
  map: string
  elapsedMs: number
  online: boolean
  timestamp: number
}

export interface AutoJoinSuccessPayload {
  serverId: string
  serverName: string
  ip: string
  port: number
  currentPlayers: number
  maxPlayers: number
  ping: number
  map: string
  attempts: number
  elapsedMs: number
}

interface ActiveSession {
  id: number
  options: AutoJoinOptions
  startedAt: number
  attempts: number
  stopped: boolean
  timers: Set<ReturnType<typeof setTimeout>>
}

let sessionSeq = 0
let currentSession: ActiveSession | null = null

export function stopAutoJoin(): { stopped: boolean } {
  if (!currentSession) return { stopped: false }
  currentSession.stopped = true
  for (const t of currentSession.timers) {
    clearTimeout(t)
  }
  currentSession.timers.clear()
  currentSession = null
  return { stopped: true }
}

export function startAutoJoin(
  options: AutoJoinOptions,
  getWindow: () => BrowserWindow | null
): { started: boolean; sessionId: number } {
  stopAutoJoin()

  const session: ActiveSession = {
    id: ++sessionSeq,
    options,
    startedAt: Date.now(),
    attempts: 0,
    stopped: false,
    timers: new Set()
  }
  currentSession = session

  const concurrency = Math.max(1, Math.min(3, options.concurrency || 1))
  const delay = Math.max(500, Math.min(10000, options.pollDelayMs || 1500))

  const runSlot = async () => {
    if (session.stopped || currentSession !== session) return

    session.attempts += 1
    const attemptNo = session.attempts
    const res = await queryA2SInfo(options.ip, options.port, 1600)

    if (session.stopped || currentSession !== session) return

    const elapsedMs = Date.now() - session.startedAt
    const win = getWindow()

    if (res.online && typeof res.players === 'number' && typeof res.maxPlayers === 'number') {
      const tick: AutoJoinTickPayload = {
        serverId: options.serverId,
        attempts: attemptNo,
        currentPlayers: res.players,
        maxPlayers: res.maxPlayers,
        ping: res.ping,
        map: res.map || '',
        elapsedMs,
        online: true,
        timestamp: Date.now()
      }
      if (win && !win.isDestroyed()) {
        win.webContents.send('auto-join-tick', tick)
      }

      if (res.players <= options.targetMaxPlayers) {
        // Slot available! Stop session and notify renderer
        session.stopped = true
        for (const t of session.timers) clearTimeout(t)
        session.timers.clear()
        if (currentSession === session) currentSession = null

        const payload: AutoJoinSuccessPayload = {
          serverId: options.serverId,
          serverName: options.serverName,
          ip: options.ip,
          port: options.port,
          currentPlayers: res.players,
          maxPlayers: res.maxPlayers,
          ping: res.ping,
          map: res.map || '',
          attempts: attemptNo,
          elapsedMs
        }
        if (win && !win.isDestroyed()) {
          win.webContents.send('auto-join-success', payload)
        }
        return
      }
    } else {
      const tick: AutoJoinTickPayload = {
        serverId: options.serverId,
        attempts: attemptNo,
        currentPlayers: -1,
        maxPlayers: -1,
        ping: -1,
        map: '',
        elapsedMs,
        online: false,
        timestamp: Date.now()
      }
      if (win && !win.isDestroyed()) {
        win.webContents.send('auto-join-tick', tick)
      }
    }

    const timer = setTimeout(() => {
      session.timers.delete(timer)
      runSlot()
    }, delay)
    session.timers.add(timer)
  }

  // Stagger slots evenly across the poll interval
  for (let i = 0; i < concurrency; i++) {
    const stagger = Math.round((delay / concurrency) * i)
    const timer = setTimeout(() => {
      session.timers.delete(timer)
      runSlot()
    }, stagger)
    session.timers.add(timer)
  }

  return { started: true, sessionId: session.id }
}
