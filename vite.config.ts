import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // The WebGL chunk (three + R3F + drei) is lazy-loaded, so it never blocks first paint.
    chunkSizeWarningLimit: 1200,
  },
})

