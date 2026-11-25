import { contextBridge, ipcRenderer } from 'electron'

const api = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    hideToTray: () => ipcRenderer.invoke('window:hideToTray'),
    quit: () => ipcRenderer.invoke('window:quit'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },
  storage: {
    load: () => ipcRenderer.invoke('storage:load'),
    save: (data: unknown) => ipcRenderer.invoke('storage:save', data)
  },
  community: {
    fetchServers: (community: 'exg' | 'zed' | 'fys') =>
      ipcRenderer.invoke('community:fetchServers', community)
  },
  exg: {
    fetchOnlineStats: () => ipcRenderer.invoke('exg:fetchOnlineStats'),
    fetchMapDict: () => ipcRenderer.invoke('exg:fetchMapDict'),
    importLocalJson: () => ipcRenderer.invoke('exg:importLocalJson')
  },
  a2s: {
    info: (ip: string, port: number) => ipcRenderer.invoke('a2s:info', ip, port),
    players: (ip: string, port: number) => ipcRenderer.invoke('a2s:players', ip, port),
    batch: (targets: Array<{ ip: string; port: number }>, concurrency?: number) =>
      ipcRenderer.invoke('a2s:batch', targets, concurrency)
  },
  autoJoin: {
    start: (options: unknown) => ipcRenderer.invoke('autojoin:start', options),
    stop: (serverId?: string) => ipcRenderer.invoke('autojoin:stop', serverId),
    onTick: (cb: (payload: any) => void) => {
      const listener = (_: unknown, payload: any) => cb(payload)
      ipcRenderer.on('auto-join-tick', listener)
      return () => ipcRenderer.removeListener('auto-join-tick', listener)
    },
    onSuccess: (cb: (payload: any) => void) => {
      const listener = (_: unknown, payload: any) => cb(payload)
      ipcRenderer.on('auto-join-success', listener)
      return () => ipcRenderer.removeListener('auto-join-success', listener)
    },
    onTrayStop: (cb: () => void) => {
      const listener = () => cb()
      ipcRenderer.on('tray-stop-autojoin', listener)
      return () => ipcRenderer.removeListener('tray-stop-autojoin', listener)
    }
  },
  game: {
    detectPaths: () => ipcRenderer.invoke('game:detectPaths'),
    isRunning: () => ipcRenderer.invoke('game:isRunning'),
    connect: (params: unknown) => ipcRenderer.invoke('game:connect', params),
    pickDirectory: (title: string) => ipcRenderer.invoke('game:pickDirectory', title)
  },
  maps: {
    scan: (cs2Path: string) => ipcRenderer.invoke('maps:scan', cs2Path),
    delete: (paths: string[], moveToTrash: boolean) =>
      ipcRenderer.invoke('maps:delete', paths, moveToTrash),
    openFolder: (targetPath: string) => ipcRenderer.invoke('maps:openFolder', targetPath)
  },
  cfg: {
    list: (cs2Path: string) => ipcRenderer.invoke('cfg:list', cs2Path),
    read: (cs2Path: string, fileName: string) => ipcRenderer.invoke('cfg:read', cs2Path, fileName),
    write: (cs2Path: string, fileName: string, content: string) =>
      ipcRenderer.invoke('cfg:write', cs2Path, fileName, content),
    delete: (cs2Path: string, fileName: string) =>
      ipcRenderer.invoke('cfg:delete', cs2Path, fileName),
    readCs2Keys: (steamPath: string) => ipcRenderer.invoke('cfg:readCs2Keys', steamPath)
  },
  gsi: {
    getState: () => ipcRenderer.invoke('gsi:getState'),
    checkConfig: (cs2Path: string) => ipcRenderer.invoke('gsi:checkConfig', cs2Path),
    installConfig: (cs2Path: string) => ipcRenderer.invoke('gsi:installConfig', cs2Path),
    onState: (cb: (state: any) => void) => {
      const listener = (_: unknown, payload: any) => cb(payload)
      ipcRenderer.on('gsi:state', listener)
      return () => ipcRenderer.removeListener('gsi:state', listener)
    },
    onEvent: (cb: (ev: any) => void) => {
      const listener = (_: unknown, payload: any) => cb(payload)
      ipcRenderer.on('gsi:event', listener)
      return () => ipcRenderer.removeListener('gsi:event', listener)
    }
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    checkUpdate: () => ipcRenderer.invoke('app:checkUpdate')
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  },
  notify: {
    show: (title: string, body: string) => ipcRenderer.invoke('notify:show', title, body)
  }
}

contextBridge.exposeInMainWorld('cs2Api', api)
