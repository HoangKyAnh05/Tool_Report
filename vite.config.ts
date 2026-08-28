import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copy preload.cjs plugin and add cloud fallback to dist-electron/main.js
function copyPreloadPlugin() {
  return {
    name: 'copy-preload-cjs',
    closeBundle() {
      const srcPreload = path.join(__dirname, 'electron/preload.cjs')
      const destDir = path.join(__dirname, 'dist-electron')
      const destPreload = path.join(destDir, 'preload.cjs')
      if (fs.existsSync(srcPreload)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        fs.copyFileSync(srcPreload, destPreload)
      }

      // Patch dist-electron/main.js to safely delegate to server.js if executed by Node on Render
      const destMain = path.join(destDir, 'main.js')
      if (fs.existsSync(destMain)) {
        let content = fs.readFileSync(destMain, 'utf-8')
        content = content.replace(
          /^import\s+\{([^}]+)\}\s+from\s+['"]electron['"];?/m,
          (_match, imports) => {
            const mappings = imports
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => {
                const parts = s.split(/\s+as\s+/)
                return parts.length === 2 ? `${parts[0]}: ${parts[1]}` : s
              })
              .join(', ')
            return `import _electronPkg from "electron";\nconst { ${mappings} } = (_electronPkg?.default || _electronPkg || {});\nif (typeof process !== 'undefined' && !process.versions?.electron) {\n  console.log('🌐 Render cloud environment detected: starting web server...');\n  await import('../server.js');\n  await new Promise(() => {});\n}`
          }
        )
        fs.writeFileSync(destMain, content, 'utf-8')
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = process.env.BUILD_TARGET === 'web' || mode === 'web'

  return {
    base: './',
    plugins: [
      tailwindcss(),
      react(),
      ...(!isWeb
        ? [
            electron([
              {
                entry: 'electron/main.ts',
              },
            ]),
            copyPreloadPlugin(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
