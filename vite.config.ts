import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generate .gz files for all assets > 1 KB
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    // Generate .br files (brotli — ~15% smaller, use when server supports it)
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ],
  build: {
    // Raise warning threshold so we can see real sizes clearly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Heavy but rarely-needed packages — load only when the popup opens
            if (id.includes('@mui/x-date-pickers') || id.includes('@mui/lab')) return 'mui-datepicker';
            // Teams SDK — only needed for Teams SSO login
            if (id.includes('@microsoft/teams-js')) return 'teams-sdk';
            // Core MUI — needed on most pages
            if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/styled-engine') || id.includes('@emotion')) return 'mui';
            // MUI icons — separate so tree-shaking works per-chunk
            if (id.includes('@mui/icons-material')) return 'mui-icons';
            // React Query
            if (id.includes('@tanstack/react-query')) return 'query';
            // React core
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'vendor';
            return 'vendor_others';
          }
        }
      },
    },
  },
})

