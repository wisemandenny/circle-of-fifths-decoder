import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from https://wisemandenny.github.io/circle-of-fifths-decoder/
  base: '/circle-of-fifths-decoder/',
  plugins: [react()],
})
