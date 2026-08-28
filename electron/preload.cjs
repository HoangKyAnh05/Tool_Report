const { contextBridge, ipcRenderer } = require('electron')

const electronAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  hideToTray: () => ipcRenderer.invoke('window:hide-to-tray'),
  close: () => ipcRenderer.invoke('window:close'),
  quit: () => ipcRenderer.invoke('window:quit'),
  wakeUpAlarm: (options) => ipcRenderer.invoke('alarm:wake-up', options),
  dismissAlarm: () => ipcRenderer.invoke('alarm:dismiss'),
  openVideoDialog: () => ipcRenderer.invoke('dialog:open-video'),
  isPackaged: () => ipcRenderer.invoke('app:is-packaged'),
  onTestTrigger: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('alarm:test-trigger', handler)
    return () => {
      ipcRenderer.removeListener('alarm:test-trigger', handler)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
