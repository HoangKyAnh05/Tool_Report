const { contextBridge, ipcRenderer } = require('electron')

const electronAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  hideToTray: () => ipcRenderer.invoke('window:hide-to-tray'),
  close: () => ipcRenderer.invoke('window:close'),
  quit: () => ipcRenderer.invoke('window:quit'),
  restartApp: () => ipcRenderer.invoke('app:restart'),
  reloadApp: () => ipcRenderer.invoke('app:reload'),
  wakeUpAlarm: (options) => ipcRenderer.invoke('alarm:wake-up', options),
  dismissAlarm: () => ipcRenderer.invoke('alarm:dismiss'),
  openVideoDialog: () => ipcRenderer.invoke('dialog:open-video'),
  cacheRemoteVideo: (url) => ipcRenderer.invoke('video:cache-remote', url),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  isPackaged: () => ipcRenderer.invoke('app:is-packaged'),
  searchOnlineImages: (query) => ipcRenderer.invoke('image:search-online', query),
  onTestTrigger: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('alarm:test-trigger', handler)
    return () => {
      ipcRenderer.removeListener('alarm:test-trigger', handler)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
