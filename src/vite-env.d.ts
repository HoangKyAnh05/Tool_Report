/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    hideToTray: () => Promise<void>
    close: () => Promise<void>
    quit: () => Promise<void>
    restartApp: () => Promise<void>
    reloadApp: () => Promise<boolean>
    wakeUpAlarm: (options: { autoFullscreen: boolean }) => Promise<boolean>
    dismissAlarm: () => Promise<boolean>
    openVideoDialog: () => Promise<{ path: string; name: string } | null>
    cacheRemoteVideo: (url: string) => Promise<string>
    openExternal: (url: string) => Promise<boolean>
    isPackaged: () => Promise<boolean>
    searchOnlineImages?: (query: string) => Promise<Array<{ title: string; imageUrl: string; source: string }>>
    onTestTrigger: (callback: () => void) => () => void
  }
}
