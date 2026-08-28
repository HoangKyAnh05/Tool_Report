import { contextBridge, ipcRenderer } from 'electron'

export interface IElectronAPI {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  hideToTray: () => Promise<void>
  close: () => Promise<void>
  quit: () => Promise<void>
  wakeUpAlarm: (options: { autoFullscreen: boolean }) => Promise<boolean>
  dismissAlarm: () => Promise<boolean>
  openVideoDialog: () => Promise<{ path: string; name: string } | null>
  isPackaged: () => Promise<boolean>
  onTestTrigger: (callback: () => void) => () => void
}

const electronAPI: IElectronAPI = {
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

declare global {
  interface Window {
    electronAPI?: IElectronAPI
  }
}
