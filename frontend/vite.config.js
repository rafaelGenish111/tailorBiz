/* global process */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'assets/images/icon.png',
        'assets/images/icon-192.png',
        'assets/images/icon-maskable.png',
        'robots.txt',
        'logo.png'
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Cache only admin routes and assets - not the public site
        navigateFallbackAllowlist: [/^\/admin/],
        runtimeCaching: [
          {
            // Cache API calls for offline support
            urlPattern: /^.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Cache fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'TailorBiz CRM',
        short_name: 'TailorBiz',
        description: 'ניהול העסק שלך מכל מקום',
        theme_color: '#232f3e',
        background_color: '#232f3e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/admin',
        start_url: '/admin',
        id: '/admin',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: 'assets/images/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/images/icon-maskable.png',
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
