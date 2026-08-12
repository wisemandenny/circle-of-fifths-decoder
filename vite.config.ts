import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://musician.dennywiseman.com/circle-of-fifths-decoder/
// The build output is nested under the same path so the deployed site root
// (dist/) can be uploaded as-is and the tool lives at its own path prefix.
export default defineConfig({
  base: '/circle-of-fifths-decoder/',
  build: {
    outDir: 'dist/circle-of-fifths-decoder',
    emptyOutDir: true,
  },
  plugins: [react()],
})
