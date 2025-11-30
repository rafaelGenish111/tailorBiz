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
        'favicon.svg',
        'robots.txt',
        // נשתמש באותו אייקון גם כ-icon וכ-apple-touch-icon
        'assets/images/image-removebg-preview.png'
      ],
      // FIX: Increase the file size limit for caching (set to 4MB)
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'TailorBiz CRM',
        short_name: 'TailorBiz',
        description: 'Business Management System',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        // מאיפה האפליקציה תיפתח כשמתקינים אותה
        start_url: '/admin/dashboard',
        icons: [
          {
            // האייקונים חייבים להתאים לקבצים שקיימים ב-public
            // כאן אנחנו משתמשים באייקון שנמצא ב-public/assets/images
            src: 'assets/images/image-removebg-preview.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/images/image-removebg-preview.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'assets/images/image-removebg-preview.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // מאפשר גישה מהרשת המקומית
    port: 5173,
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
