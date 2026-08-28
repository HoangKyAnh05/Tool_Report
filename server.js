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

const server = http.createServer(async (req, res) => {
  // Online Image Search API
  if (req.url && req.url.startsWith('/api/search-images')) {
    try {
      const urlObj = new URL(req.url, 'http://localhost')
      const q = (urlObj.searchParams.get('q') || '').trim()
      if (!q) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify([]))
        return
      }

      const res1 = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(q), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      const body1 = await res1.text()
      const match = body1.match(/vqd=([\'\"]?)([0-9-]+)\1/) || body1.match(/vqd=([0-9-]+)/)
      if (!match) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify([]))
        return
      }
      const vqd = match[2] || match[1]
      const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,;&p=1`
      const res2 = await fetch(imgUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://duckduckgo.com/',
        },
      })
      const data = await res2.json()
      const list = (data.results || []).slice(0, 24).map((r) => ({
        title: r.title || q,
        imageUrl: r.image,
        source: 'Google / Web',
      }))
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify(list))
      return
    } catch (err) {
      console.warn('Server image search error:', err)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify([]))
      return
    }
  }

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

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1
    console.log(`Port ${PORT} in use, automatically trying port ${nextPort}...`)
    server.listen(nextPort, () => {
      console.log(`🚀 Production server running at http://localhost:${nextPort}`)
    })
  } else {
    console.error('Server error:', err)
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Production server running at http://localhost:${PORT}`)
})
