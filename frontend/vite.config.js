import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: './',   // 🔥 CHANGE THIS
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})