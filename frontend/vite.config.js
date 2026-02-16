import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // קבצים סטטיים שייכנסו לבילד
      includeAssets: [
        'assets/images/icon.png',
        'robots.txt',
        'logo.png'
      ],
      // FIX: Increase the file size limit for caching (set to 4MB)
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'TailorBiz CRM',
        short_name: 'TailorBiz',
        description: 'Business Management System',
        theme_color: '#00FF99',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        // מאיפה האפליקציה תיפתח כשמתקינים אותה
        start_url: '/admin/dashboard',
        icons: [
          {
            src: 'assets/images/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/images/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // מאפשר גישה מהרשת המקומית
    port: 5173,
    proxy: {
      '/api': {
        // ברירת מחדל: 5001. אם השרת על 5000 - הגדר VITE_PROXY_TARGET=http://localhost:5000
        target: (process.env.VITE_PROXY_TARGET || 'http://localhost:5001').replace(/\/api\/?$/, '') || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Optimization: Split vendor code to reduce chunk size
  build: {
    chunkSizeWarningLimit: 1000, // Raise warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-hook-form', '@hookform/resolvers', 'yup'],
  },
})
