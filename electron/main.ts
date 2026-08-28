import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, protocol, net } from 'electron'
import path from 'path'
import url from 'url'

// Set app name
app.name = 'Video Reminder'

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

// Generate simple SVG tray icon
function createTrayIcon(): Electron.NativeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <path d="M12 9v4l2 2"/>
    <path d="M5 3 2 6"/>
    <path d="m22 6-3-3"/>
    <path d="M6.38 18.7 4 21"/>
    <path d="M17.64 18.67 20 21"/>
  </svg>`
  const buffer = Buffer.from(svg)
  return nativeImage.createFromBuffer(buffer, { width: 16, height: 16 })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    title: 'Video Reminder - Nhắc Hẹn & Báo Thức Video',
    backgroundColor: '#030712',
    frame: false, // Custom frameless window
    show: false, // Don't show until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
  })

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
