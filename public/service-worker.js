// PROFESSIONAL SERVICE WORKER - DISABLED FOR TESTING
const VERSION = '__SW_VERSION__'; // Will be replaced during build
const CACHE_NAME = `palm-olive-${VERSION}`;

// ⚠️ TEMPORARILY DISABLED - FORCE NETWORK FIRST FOR ALL REQUESTS
console.log('%c[SW] SERVICE WORKER DISABLED - ALL REQUESTS GO TO NETWORK', 'color:orange;font-weight:bold;font-size:14px');

// NO CACHE for HTML and main files - always fetch fresh
const NO_CACHE = [
  '/',
  '/index.html',
  '.html'
];

// Network First for dynamic content
const NETWORK_FIRST = [
  '/version-manifest.json',
  '/api/',
  '.json'
];

// Cache with short TTL for assets
const CACHE_SHORT = [
  '/manifest.json',
  '/icon.svg',
  '.css',
  '.js'
];

self.addEventListener('install', (event) => {
  console.log('%c[SW] Installing Dark Theme v3', 'color:green;font-weight:bold', VERSION);

  // Skip waiting immediately - activate new SW right away
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('%c[SW] Skip waiting - activating immediately', 'color:orange;font-weight:bold');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('%c[SW] Activating Dark Theme v3', 'color:blue;font-weight:bold', VERSION);

  event.waitUntil(
    Promise.all([
      // Delete ALL old caches
      caches.keys().then((cacheNames) => {
        console.log('%c[SW] Found ' + cacheNames.length + ' cache(s)', 'color:blue', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('%c[SW] 🗑️ Deleting old cache:', 'color:red;font-weight:bold', cacheName);
              return caches.delete(cacheName);
            } else {
              console.log('%c[SW] ✅ Keeping current cache:', 'color:green', cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim().then(() => {
        console.log('%c[SW] ✅ Claimed all clients', 'color:green;font-weight:bold');
        // Notify all clients about the update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            console.log('%c[SW] 📢 Notifying client:', 'color:blue', client.url);
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: VERSION
            });
          });
        });
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Ignore extensions
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // NEVER cache HTML files - always fetch fresh
  if (NO_CACHE.some(path => url.pathname.includes(path) || url.pathname.endsWith(path))) {
    console.log('[SW] NO_CACHE for:', url.pathname);
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    );
    return;
  }

  // Network First for dynamic content
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-cache'
      })
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache assets but always revalidate
  event.respondWith(
    fetch(event.request, {
      cache: 'reload'
    })
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// التحقق من التحديثات كل دقيقة
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(
      fetch('/version-manifest.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
          if (data.version !== VERSION) {
            console.log('[SW] New version available:', data.version);
            event.ports[0].postMessage({
              type: 'UPDATE_AVAILABLE',
              version: data.version
            });
          } else {
            event.ports[0].postMessage({
              type: 'NO_UPDATE'
            });
          }
        })
        .catch(error => {
          console.error('[SW] Error checking version:', error);
        })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
