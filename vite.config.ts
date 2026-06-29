import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'icons/icon.svg',
          'icons/icon-maskable.svg',
          'icons/apple-touch-icon.png',
          'icons/badge-72x72.png',
        ],
        manifest: {
          name: 'SuperLista',
          short_name: 'SuperLista',
          description:
            'Tu asistente de compras inteligente offline-first. Planifica listas de supermercado agrupadas por categorías y controla tus gastos.',
          theme_color: '#0d631b',
          background_color: '#f7fbf0',
          display: 'standalone',
          orientation: 'portrait-primary',
          lang: 'es-CL',
          scope: '/',
          start_url: '/',
          prefer_related_applications: false,
          categories: ['shopping', 'productivity', 'utilities'],
          icons: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
            { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/icon-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache the app shell
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          // Cache fonts and Google Fonts CSS
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'style' || request.destination === 'script',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
          cleanupOutdatedCaches: true,
          skipWaiting: false, // autoUpdate handles this safely
        },
        devOptions: {
          enabled: false, // SW disabled in dev to avoid stale caches during HMR
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
