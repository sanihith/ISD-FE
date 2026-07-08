import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'mui';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            return 'vendor_others';
          }
        }
      },
    },
  },
})
