// 🔥 AGGRESSIVE SERVICE WORKER - FORCES FRESH CONTENT
const VERSION = '__SW_VERSION__'; // Will be replaced during build
const CACHE_NAME = `palm-olive-${VERSION}`;
const FORCE_UPDATE_VERSION = 'v20251217_DOMAIN_CACHE_FIX';

console.log('%c[SW] 🔥 AGGRESSIVE CACHE BUSTING ACTIVE', 'color:#ef4444;font-weight:bold;font-size:16px');
console.log('%c[SW] Version: ' + VERSION, 'color:#10b981;font-size:14px');
console.log('%c[SW] Force Update: ' + FORCE_UPDATE_VERSION, 'color:#3b82f6;font-size:14px');

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
  console.log('%c[SW] 🔥 Installing NEW version', 'color:#10b981;font-weight:bold;font-size:14px', VERSION);

  // IMMEDIATELY skip waiting and activate
  event.waitUntil(
    Promise.all([
      // Delete ALL old caches immediately on install
      caches.keys().then(names => {
        console.log('%c[SW] 🗑️ Clearing ALL old caches on install...', 'color:#ef4444;font-weight:bold');
        return Promise.all(
          names.filter(name => name !== CACHE_NAME).map(name => {
            console.log('%c[SW]   Deleting: ' + name, 'color:#f59e0b');
            return caches.delete(name);
          })
        );
      }),
      // Skip waiting immediately
      self.skipWaiting()
    ]).then(() => {
      console.log('%c[SW] ✅ Install complete - activating immediately', 'color:#10b981;font-weight:bold');
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('%c[SW] 🚀 Activating NEW version', 'color:#3b82f6;font-weight:bold;font-size:14px', VERSION);

  event.waitUntil(
    Promise.all([
      // Delete ALL old caches aggressively
      caches.keys().then((cacheNames) => {
        console.log('%c[SW] Found ' + cacheNames.length + ' cache(s)', 'color:#3b82f6', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('%c[SW] 🗑️ Deleting old cache:', 'color:#ef4444;font-weight:bold', cacheName);
              return caches.delete(cacheName);
            } else {
              console.log('%c[SW] ✅ Keeping current cache:', 'color:#10b981', cacheName);
            }
          })
        );
      }),
      // Claim all clients IMMEDIATELY and force reload
      self.clients.claim().then(() => {
        console.log('%c[SW] ✅ Claimed all clients', 'color:#10b981;font-weight:bold');

        // Notify ALL clients about the update and force reload
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            console.log('%c[SW] 📢 Notifying client to reload:', 'color:#3b82f6', client.url);
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: VERSION,
              forceUpdate: FORCE_UPDATE_VERSION,
              action: 'FORCE_RELOAD'
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
