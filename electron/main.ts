import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, protocol, net, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import url, { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set app name matching package.json
app.name = 'video-reminder-app'
let logFile = ''
try {
  const appData = app.getPath('appData')
  const userDataDir = path.join(appData, 'VideoReminderApp')
  app.setPath('userData', userDataDir)
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true })
  }
  logFile = path.join(userDataDir, 'app.log')
  fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] === Electron Started ===\n`)
} catch (e) {
  console.warn('Set userData path error:', e)
}

process.on('uncaughtException', (err) => {
  if (logFile) {
    fs.appendFileSync(logFile, `[UNCAUGHT EXCEPTION] ${err?.stack || err}\n`)
  }
})

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

// Generate valid icon for tray
function createTrayIcon(): Electron.NativeImage {
  try {
    const icoPath = path.join(__dirname, '../icon.ico')
    if (fs.existsSync(icoPath)) {
      return nativeImage.createFromPath(icoPath)
    }
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
  const iconPath = path.join(__dirname, '../icon.ico')

  mainWindow = new BrowserWindow({
    width: 1050,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    title: 'Video Reminder - Nhắc Hẹn & Báo Thức Video',
    backgroundColor: '#030712',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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

  // Clear cache on startup so updated web code is always loaded fresh
  mainWindow.webContents.session.clearCache().catch(() => {})

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      mainWindow?.webContents.reloadIgnoringCache()
    }
  })

  mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (logFile) fs.appendFileSync(logFile, `[RENDERER CONSOLE ${level}] ${message} (${sourceId}:${line})\n`)
  })
  mainWindow.webContents.on('did-finish-load', () => {
    if (logFile) fs.appendFileSync(logFile, `[mainWindow did-finish-load] successfully loaded!\n`)
  })

  // Handle external links to open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      shell.openExternal(targetUrl)
    }
    return { action: 'deny' }
  })

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
      {
        label: '🔄 Tải lại ứng dụng (Reload)',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.reloadIgnoringCache()
          }
        },
      },
      {
        label: '⚡ Khởi động lại (Restart App)',
        click: () => {
          app.relaunch()
          app.exit(0)
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
      {
        label: '🌐 Mở GitHub Page (Chạy App trên Web)',
        click: () => {
          shell.openExternal('https://hoangkyanh05.github.io/Tool_Report/')
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
  // Restart & Reload
  ipcMain.handle('app:restart', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.handle('app:reload', () => {
    if (mainWindow) {
      mainWindow.webContents.reloadIgnoringCache()
    }
    return true
  })
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

  // Download & cache remote video to local disk for 100% offline & unblocked playback
  ipcMain.handle('video:cache-remote', async (_event, remoteUrl: string) => {
    try {
      if (!remoteUrl || !remoteUrl.startsWith('http')) {
        return remoteUrl
      }

      const cacheDir = path.join(app.getPath('userData'), 'cached_videos')
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }

      const hash = crypto.createHash('md5').update(remoteUrl).digest('hex')
      const localFilePath = path.join(cacheDir, `${hash}.mp4`)

      if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 1000) {
        return localFilePath
      }

      const response = await net.fetch(remoteUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: new URL(remoteUrl).origin,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      fs.writeFileSync(localFilePath, buffer)

      return localFilePath
    } catch (error) {
      console.error('Error caching remote video:', error)
      return remoteUrl
    }
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

  // Open external links safely
  ipcMain.handle('shell:open-external', (_event, targetUrl: string) => {
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      shell.openExternal(targetUrl)
      return true
    }
    return false
  })

  // Check if packaged
  ipcMain.handle('app:is-packaged', () => {
    return app.isPackaged
  })
}

// Initialize application directly
app.whenReady().then(() => {
  if (logFile) fs.appendFileSync(logFile, `app.whenReady() fired!\n`)
    
    try {
      registerMediaProtocol()
      if (logFile) fs.appendFileSync(logFile, `[1] registerMediaProtocol done\n`)
    } catch (e: any) {
      if (logFile) fs.appendFileSync(logFile, `[ERR 1] ${e?.stack || e}\n`)
    }

    try {
      setupIPC()
      if (logFile) fs.appendFileSync(logFile, `[2] setupIPC done\n`)
    } catch (e: any) {
      if (logFile) fs.appendFileSync(logFile, `[ERR 2] ${e?.stack || e}\n`)
    }

    try {
      createMainWindow()
      if (logFile) fs.appendFileSync(logFile, `[3] createMainWindow done\n`)
    } catch (e: any) {
      if (logFile) fs.appendFileSync(logFile, `[ERR 3] ${e?.stack || e}\n`)
    }

    try {
      setupSystemTray()
      if (logFile) fs.appendFileSync(logFile, `[4] setupSystemTray done\n`)
    } catch (e: any) {
      if (logFile) fs.appendFileSync(logFile, `[ERR 4] ${e?.stack || e}\n`)
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (logFile) fs.appendFileSync(logFile, `[window-all-closed] isQuitting=${isQuitting}\n`)
    if (process.platform !== 'darwin' && isQuitting) {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    if (logFile) fs.appendFileSync(logFile, `[before-quit] fired\n`)
    isQuitting = true
  })

  app.on('will-quit', () => {
    if (logFile) fs.appendFileSync(logFile, `[will-quit] fired\n`)
  })
