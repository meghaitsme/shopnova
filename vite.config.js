import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Crucial for Windows -> Docker file detection
    },
    hmr: {
      host: 'localhost', // Forces the browser to connect to localhost, not the internal container IP
      clientPort: 5173,
    },
  },
})