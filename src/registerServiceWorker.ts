// src/registerServiceWorker.ts - Service worker registration with update handling

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/src/service-worker.ts')
        .then((registration) => {
          console.log('[SW] ServiceWorker registration successful with scope: ', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; prompt user to refresh
                  console.log('[SW] New content is available; please refresh.');
                  // Could trigger UI to prompt user to refresh
                } else {
                  // Content is cached for offline use
                  console.log('[SW] Content is now available offline!');
                }
              }
            });
          });

          // Handle registration errors
        })
        .catch((error) => {
          console.error('[SW] ServiceWorker registration failed: ', error);
        });
    });
  }
}

/**
 * Unregister service worker (for debugging)
 */
export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW] Service worker unregistered');
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}