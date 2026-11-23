import path from 'node:path'
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Notification,
  Tray,
  shell,
  dialog,
  nativeTheme,
  nativeImage
} from 'electron'
import { queryA2SInfo, queryA2SPlayers, queryServersBatch } from './services/a2sQuery'
import {
  fetchCommunityServers,
  fetchExgMapDict,
  fetchExgOnlineStats,
  importFromExgAssistantJson,
  type CommunityId
} from './services/communityApi'
import { startAutoJoin, stopAutoJoin, type AutoJoinOptions } from './services/autoJoin'
import { connectToServer, detectGamePaths, isCs2Running } from './services/gameLauncher'
import { deleteMapFiles, scanCs2MapFiles } from './services/mapCleaner'
import { listCfgFiles, readCfgFile, writeCfgFile } from './services/cfgManager'
import { loadPersistedData, savePersistedData, type PersistedData } from './services/storage'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let closeBehavior: 'tray' | 'exit' = 'tray'
let minimizeToTray = false

function getIconPath(): string {
  return path.join(__dirname, '../build/icon.ico')
}

function showMainWindow() {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function createTray() {
  if (tray) return
  const icon = nativeImage.createFromPath(getIconPath())
  tray = new Tray(icon)
  tray.setToolTip('99x launcher · CS2 社区服登录器')

  const menu = Menu.buildFromTemplate([
    {
      label: '显示主界面',
      click: () => showMainWindow()
    },
    {
      label: '停止自动挤服',
      click: () => {
        stopAutoJoin()
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tray-stop-autojoin')
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出 99x launcher',
      click: () => {
        isQuitting = true
        stopAutoJoin()
        app.quit()
      }
    }
  ])

  tray.setContextMenu(menu)
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus()
    } else {
      showMainWindow()
    }
  })
  tray.on('double-click', () => showMainWindow())
}

function createWindow() {
  const initialData = loadPersistedData()
  closeBehavior = initialData.settings.closeBehavior || 'tray'
  minimizeToTray = Boolean(initialData.settings.minimizeToTray)

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1020,
    minHeight: 680,
    title: '99x launcher',
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#F3F3F3',
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const isDev = process.argv.includes('--dev')
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('minimize', () => {
    if (minimizeToTray) {
      mainWindow?.hide()
    }
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting && closeBehavior === 'tray') {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerIpcHandlers() {
  // Window controls
  ipcMain.handle('window:minimize', () => {
    if (minimizeToTray) {
      mainWindow?.hide()
    } else {
      mainWindow?.minimize()
    }
  })
  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return false
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      return false
    }
    mainWindow.maximize()
    return true
  })
  ipcMain.handle('window:close', () => {
    if (closeBehavior === 'tray') {
      mainWindow?.hide()
    } else {
      isQuitting = true
      mainWindow?.close()
    }
  })
  ipcMain.handle('window:hideToTray', () => {
    mainWindow?.hide()
  })
  ipcMain.handle('window:quit', () => {
    isQuitting = true
    stopAutoJoin()
    app.quit()
  })
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

  // Persistence
  ipcMain.handle('storage:load', () => loadPersistedData())
  ipcMain.handle('storage:save', (_, data: PersistedData) => {
    if (data?.settings) {
      closeBehavior = data.settings.closeBehavior || 'tray'
      minimizeToTray = Boolean(data.settings.minimizeToTray)
    }
    savePersistedData(data)
    return { success: true }
  })

  // Community APIs (EXG / ZED / FYS)
  ipcMain.handle('community:fetchServers', (_, community: CommunityId) =>
    fetchCommunityServers(community)
  )
  ipcMain.handle('exg:fetchOnlineStats', () => fetchExgOnlineStats())
  ipcMain.handle('exg:fetchMapDict', () => fetchExgMapDict())
  ipcMain.handle('exg:importLocalJson', async () => {
    const res = await dialog.showOpenDialog({
      title: '选择 EXG 小助手 server.json',
      filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (res.canceled || !res.filePaths[0]) return { canceled: true, servers: [] }
    return { canceled: false, servers: importFromExgAssistantJson(res.filePaths[0]) }
  })

  // Valve A2S UDP Queries
  ipcMain.handle('a2s:info', (_, ip: string, port: number) => queryA2SInfo(ip, port))
  ipcMain.handle('a2s:players', (_, ip: string, port: number) => queryA2SPlayers(ip, port))
  ipcMain.handle(
    'a2s:batch',
    (_, targets: Array<{ ip: string; port: number }>, concurrency?: number) =>
      queryServersBatch(targets, concurrency ?? 12, 1400)
  )

  // Auto-Join (multi-server concurrent queue)
  ipcMain.handle('autojoin:start', (_, options: AutoJoinOptions) =>
    startAutoJoin(options, () => mainWindow)
  )
  ipcMain.handle('autojoin:stop', (_, serverId?: string) => stopAutoJoin(serverId))

  // Game Launching & Path Detection
  ipcMain.handle('game:detectPaths', () => detectGamePaths())
  ipcMain.handle('game:isRunning', () => isCs2Running())
  ipcMain.handle('game:connect', (_, params) => connectToServer(params))
  ipcMain.handle('game:pickDirectory', async (_, title: string) => {
    const res = await dialog.showOpenDialog({
      title: title || '选择目录',
      properties: ['openDirectory']
    })
    if (res.canceled || !res.filePaths[0]) return ''
    return res.filePaths[0]
  })

  // Map File Cleaner
  ipcMain.handle('maps:scan', (_, cs2Path: string) => scanCs2MapFiles(cs2Path))
  ipcMain.handle('maps:delete', (_, paths: string[], moveToTrash: boolean) =>
    deleteMapFiles(paths, moveToTrash)
  )
  ipcMain.handle('maps:openFolder', (_, targetPath: string) => shell.openPath(targetPath))

  // CFG Manager
  ipcMain.handle('cfg:list', (_, cs2Path: string) => listCfgFiles(cs2Path))
  ipcMain.handle('cfg:read', (_, cs2Path: string, fileName: string) =>
    readCfgFile(cs2Path, fileName)
  )
  ipcMain.handle('cfg:write', (_, cs2Path: string, fileName: string, content: string) =>
    writeCfgFile(cs2Path, fileName, content)
  )

  // External links & Notifications
  ipcMain.handle('shell:openExternal', (_, url: string) => shell.openExternal(url))
  ipcMain.handle('notify:show', (_, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
    return { success: true }
  })
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showMainWindow()
  })

  app.whenReady().then(() => {
    app.setAppUserModelId('com.99x.launcher')
    registerIpcHandlers()
    createTray()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
      else showMainWindow()
    })
  })
}

app.on('before-quit', () => {
  isQuitting = true
  stopAutoJoin()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit()
  }
})
