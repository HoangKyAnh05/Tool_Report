import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, protocol, net } from 'electron'
import path from 'node:path'
import url, { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set app name & isolate userData path to avoid collision with other electron projects
app.name = 'VideoReminderApp'
try {
  const appData = app.getPath('appData')
  app.setPath('userData', path.join(appData, 'VideoReminderApp'))
} catch (e) {
  console.warn('Set userData path error:', e)
}

// Disable GPU acceleration if necessary or enable hardware video decoding
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Create custom media protocol for secure local video streaming
function registerMediaProtocol() {
  protocol.handle('media', (request) => {
    try {
      // Decode the URL path
      const filePath = decodeURIComponent(request.url.replace('media:///', '').replace('media://', ''))
      // On Windows, handle drive letters like D:/ or D:\
      return net.fetch(url.pathToFileURL(filePath).toString())
    } catch (error) {
      console.error('Failed to handle media protocol request:', error)
      return new Response('File not found', { status: 404 })
    }
  })
}

// Generate simple 16x16 PNG tray icon (bell cyan)
function createTrayIcon(): Electron.NativeImage {
  try {
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkoBAwUqifYdQAkGNYmJl/Y5OMxafpPzYDKDYY4gOMjIwM6G4AmwE4DRkAbU0HCEb+7vUAAAAASUVORK5CYII='
    const img = nativeImage.createFromBuffer(Buffer.from(pngBase64, 'base64'))
    return img
  } catch (e) {
    return nativeImage.createEmpty()
  }
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs')

  mainWindow = new BrowserWindow({
    width: 1050,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    title: 'Video Reminder - Nhắc Hẹn & Báo Thức Video',
    backgroundColor: '#030712',
    frame: false, // Custom frameless window
    show: true, // Show immediately on launch
    center: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows playing local media
    },
  })

  // Prevent window title override
  mainWindow.on('page-title-updated', (e) => e.preventDefault())

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  // Fallback ensure visible
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
  }, 500)

  // When user clicks close button [X], minimize to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
      if (tray) {
        tray.displayBalloon?.({
          title: 'Video Reminder',
          content: 'Ứng dụng đang chạy ngầm trong khay hệ thống để tiếp tục theo dõi lịch nhắc hẹn.',
        })
      }
    }
  })
}

function setupSystemTray() {
  try {
    const icon = createTrayIcon()
    tray = new Tray(icon)
    tray.setToolTip('Video Reminder - Đang chạy ngầm')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '⏰ Mở Video Reminder',
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.focus()
          }
        },
      },
      { type: 'separator' },
      {
        label: '🔔 Kích hoạt thử chuông báo',
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.webContents.send('alarm:test-trigger')
          }
        },
      },
      { type: 'separator' },
      {
        label: '❌ Thoát ứng dụng hoàn toàn',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])

    tray.setContextMenu(contextMenu)

    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })
  } catch (err) {
    console.warn('System tray setup warning:', err)
  }
}

// Setup IPC Handlers
function setupIPC() {
  // Window controls
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:hide-to-tray', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('window:quit', () => {
    isQuitting = true
    app.quit()
  })

  // Alarm Wake-up Trigger
  ipcMain.handle('alarm:wake-up', (_event, { autoFullscreen }) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
      mainWindow.focus()
      mainWindow.flashFrame(true)

      if (autoFullscreen && !mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true)
      }
    }
    return true
  })

  // Dismiss Alarm
  ipcMain.handle('alarm:dismiss', () => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(false)
      mainWindow.flashFrame(false)
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false)
      }
    }
    return true
  })

  // Open Native Video Picker
  ipcMain.handle('dialog:open-video', async () => {
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Chọn file video nhắc hẹn',
      properties: ['openFile'],
      filters: [
        {
          name: 'Video Files',
          extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const fileName = path.basename(filePath)
      return {
        path: filePath,
        name: fileName,
      }
    }
    return null
  })

  // Check if packaged
  ipcMain.handle('app:is-packaged', () => {
    return app.isPackaged
  })
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    registerMediaProtocol()
    setupIPC()
    createMainWindow()
    setupSystemTray()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && isQuitting) {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    isQuitting = true
  })
}
