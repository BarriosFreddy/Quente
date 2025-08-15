import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // Aprovecha lo que soporta Bun
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      esbuild: path.resolve(process.env.BUN_INSTALL_CACHE_DIR || '', 'bun-esbuild-shim.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/_variables.scss";` // si tienes un archivo global
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Bun tiene su propia versión interna
    outDir: 'dist'
  }
})
