/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
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
}
