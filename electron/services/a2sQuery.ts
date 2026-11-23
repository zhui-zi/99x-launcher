import dgram from 'node:dgram'

export interface A2SInfoResult {
  online: boolean
  ip: string
  port: number
  ping: number
  name?: string
  map?: string
  folder?: string
  game?: string
  appId?: number
  players?: number
  maxPlayers?: number
  bots?: number
  vac?: boolean
  password?: boolean
  version?: string
  keywords?: string
  error?: string
}

export interface A2SPlayer {
  index: number
  name: string
  score: number
  duration: number
}

export interface A2SPlayersResult {
  online: boolean
  players: A2SPlayer[]
  error?: string
}

const A2S_INFO_REQUEST = Buffer.from([
  0xff, 0xff, 0xff, 0xff,
  0x54, // 'T'
  ...Buffer.from('Source Engine Query\0', 'ascii')
])

function readCString(buf: Buffer, offset: number): [string, number] {
  const end = buf.indexOf(0x00, offset)
  if (end === -1) return [buf.toString('utf8', offset), buf.length]
  return [buf.toString('utf8', offset, end), end + 1]
}

function parseA2SInfo(buf: Buffer, ip: string, port: number, ping: number): A2SInfoResult {
  if (buf.length < 7 || buf[4] !== 0x49) {
    return { online: false, ip, port, ping: -1, error: 'Invalid A2S_INFO header' }
  }
  let offset = 6 // skip 4-byte header + 0x49 + protocol byte
  const [name, o1] = readCString(buf, offset); offset = o1
  const [map, o2] = readCString(buf, offset); offset = o2
  const [folder, o3] = readCString(buf, offset); offset = o3
  const [game, o4] = readCString(buf, offset); offset = o4

  if (offset + 7 > buf.length) {
    return { online: true, ip, port, ping, name, map, folder, game }
  }

  const appId = buf.readUInt16LE(offset); offset += 2
  const players = buf.readUInt8(offset); offset += 1
  const maxPlayers = buf.readUInt8(offset); offset += 1
  const bots = buf.readUInt8(offset); offset += 1
  offset += 2 // serverType + environment
  const visibility = buf.readUInt8(offset); offset += 1
  const vac = buf.readUInt8(offset) === 1; offset += 1
  const [version, o5] = readCString(buf, offset); offset = o5

  let keywords = ''
  if (offset < buf.length) {
    const edf = buf.readUInt8(offset); offset += 1
    if (edf & 0x80) offset += 2 // port
    if (edf & 0x10) offset += 8 // steamID
    if (edf & 0x40) {
      offset += 2 // spectator port
      const [, nextO] = readCString(buf, offset)
      offset = nextO
    }
    if (edf & 0x20 && offset < buf.length) {
      const [kw, nextO] = readCString(buf, offset)
      keywords = kw
      offset = nextO
    }
  }

  return {
    online: true,
    ip,
    port,
    ping,
    name,
    map,
    folder,
    game,
    appId,
    players,
    maxPlayers,
    bots,
    vac,
    password: visibility === 1,
    version,
    keywords
  }
}

export function queryA2SInfo(ip: string, port: number, timeoutMs = 2200): Promise<A2SInfoResult> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4')
    let settled = false
    let sentAt = Date.now()

    const finish = (res: A2SInfoResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        socket.close()
      } catch {
        // ignore
      }
      resolve(res)
    }

    const timer = setTimeout(() => {
      finish({ online: false, ip, port, ping: -1, error: 'Timeout' })
    }, timeoutMs)

    socket.on('error', (err) => {
      finish({ online: false, ip, port, ping: -1, error: err.message })
    })

    socket.on('message', (msg) => {
      if (msg.length < 5) return
      const header = msg[4]
      if (header === 0x41 && msg.length >= 9) {
        // Challenge response: re-send with 4-byte challenge token
        const challenge = msg.subarray(5, 9)
        const packet = Buffer.concat([A2S_INFO_REQUEST, challenge])
        sentAt = Date.now()
        socket.send(packet, port, ip)
        return
      }
      if (header === 0x49) {
        const ping = Math.max(1, Date.now() - sentAt)
        finish(parseA2SInfo(msg, ip, port, ping))
      }
    })

    sentAt = Date.now()
    socket.send(A2S_INFO_REQUEST, port, ip, (err) => {
      if (err) finish({ online: false, ip, port, ping: -1, error: err.message })
    })
  })
}

export function queryA2SPlayers(ip: string, port: number, timeoutMs = 2500): Promise<A2SPlayersResult> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4')
    let settled = false

    const finish = (res: A2SPlayersResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        socket.close()
      } catch {
        // ignore
      }
      resolve(res)
    }

    const timer = setTimeout(() => {
      finish({ online: false, players: [], error: 'Timeout' })
    }, timeoutMs)

    socket.on('error', (err) => {
      finish({ online: false, players: [], error: err.message })
    })

    socket.on('message', (msg) => {
      if (msg.length < 5) return
      const header = msg[4]
      if (header === 0x41 && msg.length >= 9) {
        const packet = Buffer.concat([
          Buffer.from([0xff, 0xff, 0xff, 0xff, 0x55]),
          msg.subarray(5, 9)
        ])
        socket.send(packet, port, ip)
        return
      }
      if (header === 0x44 && msg.length >= 6) {
        const count = msg.readUInt8(5)
        const players: A2SPlayer[] = []
        let offset = 6
        for (let i = 0; i < count && offset < msg.length; i++) {
          const index = msg.readUInt8(offset); offset += 1
          const [name, nextO] = readCString(msg, offset); offset = nextO
          if (offset + 8 > msg.length) break
          const score = msg.readInt32LE(offset); offset += 4
          const duration = msg.readFloatLE(offset); offset += 4
          players.push({
            index,
            name: name.trim() || `Player #${i + 1}`,
            score,
            duration: Math.max(0, Math.round(duration))
          })
        }
        finish({ online: true, players })
      }
    })

    const initial = Buffer.from([0xff, 0xff, 0xff, 0xff, 0x55, 0xff, 0xff, 0xff, 0xff])
    socket.send(initial, port, ip, (err) => {
      if (err) finish({ online: false, players: [], error: err.message })
    })
  })
}

export async function queryServersBatch(
  targets: Array<{ ip: string; port: number }>,
  concurrency = 10,
  timeoutMs = 1800
): Promise<Record<string, A2SInfoResult>> {
  const results: Record<string, A2SInfoResult> = {}
  let idx = 0

  async function worker() {
    while (idx < targets.length) {
      const current = targets[idx++]
      const key = `${current.ip}:${current.port}`
      results[key] = await queryA2SInfo(current.ip, current.port, timeoutMs)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, targets.length) }, () => worker())
  await Promise.all(workers)
  return results
}
