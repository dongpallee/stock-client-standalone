import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',  // Allow access from all network interfaces
    port: 8080,       // Development server port
    open: true,       // Auto-open browser on server start
    watch: {
      usePolling: true,  // Enable polling for file changes (useful in some environments)
      interval: 1000,    // Check for file changes every 1 second
    },
    // Note: This is a standalone frontend application.
    // The proxy configuration below is disabled by default.
    // To connect to a backend API server, uncomment and configure the proxy settings.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:9001',  // Your backend API server
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/socket.io': {
    //     target: 'http://localhost:9001',  // Your WebSocket server
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true,
    //   }
    // }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'charts': ['recharts'],
        }
      }
    }
  }
})
