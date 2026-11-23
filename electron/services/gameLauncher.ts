import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { shell } from 'electron'

const execAsync = promisify(exec)

export interface DetectedPaths {
  cs2Path: string
  steamPath: string
}

export async function detectGamePaths(): Promise<DetectedPaths> {
  let cs2Path = ''
  let steamPath = ''

  // 1. Try reading EXG assistant config if available
  const exgConfig = 'C:\\Users\\keita\\OneDrive\\Game\\CSGO\\exg小助手\\exg_assistant.json'
  if (fs.existsSync(exgConfig)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(exgConfig, 'utf8'))
      if (parsed?.lastCs2Path && fs.existsSync(parsed.lastCs2Path)) {
        cs2Path = parsed.lastCs2Path
      }
    } catch {
      // ignore
    }
  }

  // 2. Check Windows Registry for SteamPath
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync(
        'reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath'
      )
      const match = stdout.match(/SteamPath\s+REG_SZ\s+(.+)/i)
      if (match?.[1]) {
        steamPath = match[1].trim().replace(/\//g, '\\')
      }
    } catch {
      // ignore
    }
  }

  // 3. Probe common CS2 install locations if not found yet
  if (!cs2Path) {
    const candidates = [
      steamPath ? path.join(steamPath, 'steamapps', 'common', 'Counter-Strike Global Offensive') : '',
      'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive',
      'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive',
      'E:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive',
      'D:\\Steam\\steamapps\\common\\Counter-Strike Global Offensive'
    ].filter(Boolean)

    for (const dir of candidates) {
      if (fs.existsSync(path.join(dir, 'game', 'bin', 'win64', 'cs2.exe')) || fs.existsSync(dir)) {
        cs2Path = dir
        break
      }
    }
  }

  return { cs2Path, steamPath }
}

export async function isCs2Running(): Promise<boolean> {
  if (process.platform !== 'win32') return false
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq cs2.exe" /NH')
    return stdout.toLowerCase().includes('cs2.exe')
  } catch {
    return false
  }
}

export async function connectToServer(params: {
  ip: string
  port: number
  launchMode: 'steam_connect' | 'steam_rungameid'
  regionFlag: 'worldwide' | 'perfectworld' | 'none'
  extraLaunchArgs?: string
}): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const addr = `${params.ip}:${params.port}`
    let url = `steam://connect/${addr}`
    if (params.launchMode === 'steam_rungameid') {
      const args: string[] = []
      if (params.regionFlag === 'worldwide') args.push('-worldwide')
      if (params.regionFlag === 'perfectworld') args.push('-perfectworld')
      if (params.extraLaunchArgs?.trim()) args.push(params.extraLaunchArgs.trim())
      args.push(`+connect ${addr}`)
      url = `steam://rungameid/730//${encodeURIComponent(args.join(' '))}`
    }
    await shell.openExternal(url)
    return { success: true, url }
  } catch (err: any) {
    return { success: false, url: '', error: err?.message || '启动 Steam 失败' }
  }
}
