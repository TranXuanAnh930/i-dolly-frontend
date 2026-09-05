import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // some deps (fingerprintjs2 / ua-parser-js chain) still reference the Node
  // `process` global at module init time; Vite doesn't polyfill it like webpack did
  define: {
    'process.env': {}
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: `
          @use "@/scss/_variables.scss" as *;
          @use "@/scss/_fonts.scss" as *;
          @use "@/scss/_medias.scss" as *;
          @use "@/scss/_mixins.scss" as *;
        `
      }
    }
  },

  server: {
    port: 8080
  }
})
