const VERSION = 'v20251030_1761819296413';
const CACHE_NAME = `palm-olive-${VERSION}`;

// استراتيجية: Network First للملفات الديناميكية
const NETWORK_FIRST = [
  '/version-manifest.json',
  '/api/',
];

// استراتيجية: Cache First للأصول الثابتة
const CACHE_FIRST = [
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened:', CACHE_NAME);
      return cache.addAll(CACHE_FIRST);
    }).then(() => {
      console.log('[SW] Skip waiting');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // تجاهل Chrome Extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Network First للملفات الديناميكية
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First للأصول الثابتة
  if (CACHE_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Network First للباقي (HTML, JS, CSS)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // لا تخزن الاستجابات غير الناجحة
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
