// FORCE UPDATE SERVICE WORKER - Ultra Aggressive Cache Killer
// This SW will FORCE users to get the latest version

const CURRENT_VERSION = 'v20251029_1761769056630';
const CACHE_NAME = `app-cache-${CURRENT_VERSION}`;

console.log('[SW] Installing version:', CURRENT_VERSION);

// Install - delete all old caches immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CURRENT_VERSION);

  event.waitUntil(
    (async () => {
      // Delete ALL old caches
      const cacheNames = await caches.keys();
      console.log('[SW] Found caches:', cacheNames);

      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      console.log('[SW] All old caches deleted');

      // Skip waiting - activate immediately
      await self.skipWaiting();
      console.log('[SW] Skip waiting - activating immediately');
    })()
  );
});

// Activate - claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CURRENT_VERSION);

  event.waitUntil(
    (async () => {
      // Delete ALL old caches again (safety)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache in activate:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      // Claim all clients immediately
      await self.clients.claim();
      console.log('[SW] Claimed all clients');

      // Force reload all clients
      const clients = await self.clients.matchAll({ type: 'window' });
      console.log('[SW] Found clients:', clients.length);

      clients.forEach(client => {
        console.log('[SW] Navigating client to:', client.url);
        client.navigate(client.url);
      });
    })()
  );
});

// Fetch - NEVER cache, always get fresh
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache HTML files
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    console.log('[SW] Fetching fresh (no cache):', url.pathname);
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    );
    return;
  }

  // Never cache version-manifest
  if (url.pathname.includes('version-manifest.json')) {
    console.log('[SW] Fetching fresh manifest');
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
    );
    return;
  }

  // For assets with hash (like index-ABC123.js), use cache
  if (url.pathname.includes('/assets/') && /\-[a-zA-Z0-9]{8,}\.(js|css)/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Using cached asset:', url.pathname);
          return cachedResponse;
        }

        console.log('[SW] Fetching and caching asset:', url.pathname);
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else - fetch fresh
  event.respondWith(fetch(event.request));
});

// Message handler - check for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('[SW] Check update requested');

    fetch('/version-manifest.json?t=' + Date.now())
      .then(response => response.json())
      .then(data => {
        if (data.version !== CURRENT_VERSION) {
          console.log('[SW] New version detected:', data.version);
          event.ports[0].postMessage({
            type: 'UPDATE_AVAILABLE',
            version: data.version
          });
        } else {
          console.log('[SW] Already latest version');
          event.ports[0].postMessage({
            type: 'UP_TO_DATE',
            version: CURRENT_VERSION
          });
        }
      })
      .catch(err => {
        console.error('[SW] Error checking version:', err);
      });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded for version:', CURRENT_VERSION);
