import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: (() => {
      const alignmentApiTarget = process.env.VITE_ALIGNMENT_API_TARGET || 'http://replica-vm-maria:8000'
      const bibleApiTarget = process.env.VITE_BIBLE_API_TARGET || 'http://berlin-vm-maria:8000'
      return {
        '/alignment-api': {
          target: alignmentApiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/alignment-api/, '')
        },
        '/bible-api': {
          target: bibleApiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bible-api/, '')
        }
      }
    })()
  }
})
