import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copy preload.cjs plugin
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
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    electron([
      {
        entry: 'electron/main.ts',
      },
    ]),
    copyPreloadPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
