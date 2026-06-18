// src/service-worker.ts - Service Worker implementation with Workbox

import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { precacheAndRoute } from 'workbox-precaching';

// Enable background sync for offline operations
const backgroundSyncPlugin = new BackgroundSyncPlugin('shopping-queue', {
  maxRetentionTime: 60 * 60 * 24, // 24 hours to retry failed requests
});

// Static assets configuration
precacheAndRoute([
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/src/components/ActiveList.tsx',
  '/src/components/ConfigScreen.tsx',
  '/src/components/HistoryList.tsx',
  '/src/components/TemplatesList.tsx',
  '/src/App.tsx',
  '/src/utils/categorizer.ts',
  '/src/types.ts',
]);

// Cache static assets (CSS, JS, images)
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Cache API responses for shopping operations
registerRoute(
  ({ url }) => url.pathname.includes('/api') || url.pathname.includes('/shopping'),
  new NetworkFirst({
    cacheName: 'shopping-api',
    plugins: [
      backgroundSyncPlugin,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  }),
);

// Offline fallback for navigation
registerRoute(
  ({ url }) => true, // All routes
  new StaleWhileRevalidate({
    cacheName: 'pages-cache',
    fallbackToNavigate: '/',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  }),
);

// Handle failed requests with background sync retry
self.addEventListener('sync', (event) => {
  if (event.tag === 'shopping-queue') {
    console.log('[SW] Background sync for shopping queue');
    // Retry failed shopping operations when network returns
  }
});

// Log installation
self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  event.waitUntil(self.skipWaiting());
});

// Activate and clean up old caches
let keepCache = [new RegExp('shopping-api'), new RegExp('static-resources'), new RegExp('images'), new RegExp('pages-cache')];
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');

  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => !keepCache.some((regex) => cacheName.match(regex)))
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const title = 'SuperLista Notification';
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: '/',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if available
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window
        return clients.openWindow(event.notification.data.url || '/');
      })
  );
});

export {};