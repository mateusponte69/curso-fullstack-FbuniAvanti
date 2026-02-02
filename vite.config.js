import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Essencial para SPA no Render
  root: 'client', // Define a raiz como client/ onde está o index.html
  build: {
    outDir: 'dist', // Output relativo ao root (client/dist)
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
