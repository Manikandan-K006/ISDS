import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'spa',
  build: { target: 'es2020' },
  server: { port: 3000, proxy: { '/api': 'http://localhost:5000' } }
})
