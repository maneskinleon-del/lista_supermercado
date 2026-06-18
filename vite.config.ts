import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { workbox } from '@vitejs/plugin-workbox';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      workbox({
        globPatterns: ['dist/**/*.{js,css,html}', 'dist/**/*.png', 'dist/**/*.jpg', 'dist/**/*.svg'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.pathname.startsWith('/shopping'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shopping-api',
              expiration: {
                maxEntries: 50,
                maxAgeHours: 1,
              },
            },
          },
        ],
        navigateFallback: '/index.html',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
