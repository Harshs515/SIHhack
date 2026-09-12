import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png', 'icons/*.svg'],
      manifest: false, // We provide our own /public/manifest.json

      workbox: {
        // ── Precache all build output ──
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,          // Let the user decide (UpdateToast)
        clientsClaim: false,

        // ── Runtime caching strategies ──
        runtimeCaching: [
          // 1. API calls — NetworkFirst (fresh data preferred, fallback cache)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'trinetra-api-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 5 * 60,       // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 2. Map tiles — CacheFirst (stable, rarely change)
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'trinetra-map-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 3. Google Fonts stylesheets — StaleWhileRevalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          // 4. Google Fonts files — CacheFirst (immutable)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 5. All other CDN images — CacheFirst
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'trinetra-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],

        // Background sync for offline complaint submissions
        offlineGoogleAnalytics: false,
      },

      // Dev-mode SW (for testing in development)
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],

  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
