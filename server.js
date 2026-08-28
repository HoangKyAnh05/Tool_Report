import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

// Determine web root directory (prefer dist, fallback to docs or trigger build)
let webRoot = path.join(__dirname, 'dist')
if (!fs.existsSync(path.join(webRoot, 'index.html'))) {
  const docsDir = path.join(__dirname, 'docs')
  if (fs.existsSync(path.join(docsDir, 'index.html'))) {
    webRoot = docsDir
  } else {
    try {
      console.log('📦 Building web assets on the fly...')
      execSync('npm run build:web', { stdio: 'inherit', cwd: __dirname })
      webRoot = path.join(__dirname, 'dist')
    } catch (e) {
      console.error('Build on startup failed:', e)
    }
  }
}

console.log(`📂 Serving static files from: ${webRoot}`)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
}

const server = http.createServer((req, res) => {
  let parsedUrl = req.url.split('?')[0]
  if (parsedUrl === '/') {
    parsedUrl = '/index.html'
  }

  let filePath = path.join(webRoot, parsedUrl)

  // Direct file match
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  // SPA fallback to index.html
  const indexPath = path.join(webRoot, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(indexPath).pipe(res)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('404 Not Found')
})

server.listen(PORT, () => {
  console.log(`🚀 Production server running at http://localhost:${PORT}`)
})
