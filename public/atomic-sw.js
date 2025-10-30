// ⚛️ ATOMIC DEPLOYMENT SERVICE WORKER
// Implements enterprise-grade atomic deployment with rollback support

const CACHE_NAME = 'atomic-v1';
const MANIFEST_CHECK_INTERVAL = 30000; // 30 seconds
let currentManifest = null;
let verificationInProgress = false;

// Install event
self.addEventListener('install', (event) => {
  console.log('⚛️ [Atomic SW] Installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('⚛️ [Atomic SW] Activating...');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('⚛️ [Atomic SW] Claimed all clients');
      // Start manifest checking
      startManifestMonitoring();
    })
  );
});

// Fetch manifest with cache bypass
async function fetchManifest() {
  try {
    const response = await fetch(`/manifest.json?nocache=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('⚛️ [Atomic SW] Failed to fetch manifest:', error);
    return null;
  }
}

// Verify file integrity
async function verifyFileIntegrity(filePath, expectedHash) {
  try {
    const response = await fetch(filePath, { cache: 'no-store' });
    if (!response.ok) return false;

    const buffer = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const actualHash = `sha256-${hashHex}`;

    return actualHash === expectedHash;
  } catch (error) {
    console.error('⚛️ [Atomic SW] Integrity check failed for', filePath, error);
    return false;
  }
}

// Check for updates and trigger reload if needed
async function checkForUpdates() {
  if (verificationInProgress) {
    console.log('⚛️ [Atomic SW] Verification already in progress, skipping...');
    return;
  }

  verificationInProgress = true;

  try {
    const manifest = await fetchManifest();

    if (!manifest) {
      console.log('⚛️ [Atomic SW] No manifest available');
      verificationInProgress = false;
      return;
    }

    // First time or version changed
    if (!currentManifest || currentManifest.version !== manifest.version) {
      console.log(`⚛️ [Atomic SW] New version detected: ${manifest.version}`);
      console.log(`⚛️ [Atomic SW] Current: ${currentManifest?.version || 'none'}`);
      console.log(`⚛️ [Atomic SW] Strategy: ${manifest.deployment.strategy}`);

      // Verify integrity of critical files
      let integrityValid = true;

      if (manifest.files['index.html']) {
        console.log('⚛️ [Atomic SW] Verifying index.html integrity...');
        integrityValid = await verifyFileIntegrity(
          manifest.files['index.html'].path,
          manifest.files['index.html'].hash
        );

        if (!integrityValid) {
          console.error('⚛️ [Atomic SW] ❌ Integrity check failed for index.html');
          console.error('⚛️ [Atomic SW] 🔄 Rollback: Keeping current version');
          verificationInProgress = false;
          return;
        }
      }

      console.log('⚛️ [Atomic SW] ✅ Integrity verification passed');

      // Clear all caches
      const cacheNames = await caches.keys();
      console.log(`⚛️ [Atomic SW] Clearing ${cacheNames.length} cache(s)...`);
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      // Update current manifest
      currentManifest = manifest;

      // Save to localStorage via clients
      const allClients = await clients.matchAll({ type: 'window' });

      for (const client of allClients) {
        client.postMessage({
          type: 'NEW_VERSION_AVAILABLE',
          version: manifest.version,
          timestamp: manifest.timestamp,
          channel: manifest.channel,
          filesCount: Object.keys(manifest.files).length
        });
      }

      console.log(`⚛️ [Atomic SW] 🎉 Version ${manifest.version} verified and activated`);
      console.log(`⚛️ [Atomic SW] 📡 Notified ${allClients.length} client(s)`);
    }

  } catch (error) {
    console.error('⚛️ [Atomic SW] Error during update check:', error);
  } finally {
    verificationInProgress = false;
  }
}

// Start monitoring for manifest changes
function startManifestMonitoring() {
  console.log('⚛️ [Atomic SW] Starting manifest monitoring...');

  // Check immediately
  checkForUpdates();

  // Then check periodically
  setInterval(() => {
    checkForUpdates();
  }, MANIFEST_CHECK_INTERVAL);
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('⚛️ [Atomic SW] Received message:', event.data);

  if (event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  }

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: currentManifest?.version || 'unknown',
      timestamp: currentManifest?.timestamp,
      channel: currentManifest?.channel
    });
  }

  if (event.data.type === 'FORCE_RELOAD') {
    // Clear everything and force reload
    caches.keys().then(names => {
      return Promise.all(names.map(name => caches.delete(name)));
    }).then(() => {
      clients.matchAll({ type: 'window' }).then(clientsList => {
        clientsList.forEach(client => {
          client.navigate(client.url);
        });
      });
    });
  }
});

// Fetch event - no caching for HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache HTML files
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store'
      })
    );
    return;
  }

  // Never cache manifest
  if (url.pathname.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store'
      })
    );
    return;
  }

  // Pass through everything else
  event.respondWith(fetch(event.request));
});

console.log('⚛️ [Atomic SW] Loaded and ready');
