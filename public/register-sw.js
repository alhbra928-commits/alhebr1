// Register Service Worker - Force Update System
(function() {
  'use strict';

  const VERSION = 'v20251029_1761769056630';

  console.log('%c🚀 FORCE UPDATE SYSTEM STARTING', 'color: #0f0; font-size: 20px; font-weight: bold');
  console.log('Current Version:', VERSION);

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return;
  }

  // Register Service Worker
  navigator.serviceWorker.register('/sw-force-update.js', {
    scope: '/',
    updateViaCache: 'none' // NEVER cache the SW file itself
  })
  .then(registration => {
    console.log('✅ Service Worker registered:', registration.scope);

    // Check for updates every 30 seconds
    setInterval(() => {
      console.log('🔍 Checking for updates...');
      registration.update();
    }, 30000);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🆕 New Service Worker installing...');

      newWorker.addEventListener('statechange', () => {
        console.log('SW State:', newWorker.state);

        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('%c🔥 NEW VERSION AVAILABLE - FORCING UPDATE!', 'color: #ff0; font-size: 18px; font-weight: bold');

          // Tell the new SW to take over immediately
          newWorker.postMessage({ type: 'SKIP_WAITING' });

          // Show update banner
          showUpdateBanner();
        }
      });
    });

    // Check version immediately
    checkVersion();
  })
  .catch(err => {
    console.error('❌ SW registration failed:', err);
  });

  // Listen for controller change (new SW activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('%c🔄 NEW SERVICE WORKER ACTIVATED - RELOADING!', 'color: #f00; font-size: 20px; font-weight: bold');

    // Force hard reload
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname + '?v=' + VERSION + '&t=' + Date.now();
    }, 500);
  });

  // Check version against server
  function checkVersion() {
    fetch('/version-manifest.json?t=' + Date.now(), {
      cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
      const serverVersion = data.version;
      const storedVersion = localStorage.getItem('app-version-v3');

      console.log('Server Version:', serverVersion);
      console.log('Stored Version:', storedVersion);

      if (storedVersion !== serverVersion) {
        console.log('%c🔥 VERSION MISMATCH - CLEARING EVERYTHING!', 'color: #f00; font-size: 18px; font-weight: bold');

        // Clear all caches
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
              console.log('🗑️ Deleted cache:', name);
            });
          });
        }

        // Clear storage (except auth)
        const authKeys = ['admin-session', 'investor-session', 'farm-owner-session'];
        const authData = {};
        authKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) authData[key] = value;
        });

        localStorage.clear();
        sessionStorage.clear();

        // Restore auth
        Object.keys(authData).forEach(key => {
          localStorage.setItem(key, authData[key]);
        });

        // Set new version
        localStorage.setItem('app-version-v3', serverVersion);

        if (storedVersion) {
          console.log('%c🔄 FORCING HARD RELOAD IN 1 SECOND...', 'color: #ff0; font-size: 16px; font-weight: bold');

          setTimeout(() => {
            window.location.href = window.location.origin + window.location.pathname + '?v=' + serverVersion + '&t=' + Date.now();
          }, 1000);
        }
      } else {
        console.log('%c✅ UP TO DATE', 'color: #0f0; font-size: 16px; font-weight: bold');
      }
    })
    .catch(err => {
      console.error('Error checking version:', err);
    });
  }

  // Show update banner
  function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideDown 0.5s ease-out;
    `;

    banner.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
        🎉 إصدار جديد متاح!
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        انقر للتحديث والحصول على آخر الميزات
      </div>
      <button onclick="window.location.reload(true)" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 10px 30px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        تحديث الآن
      </button>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(banner);
  }

  // Visual version indicator
  const indicator = document.createElement('div');
  indicator.id = 'version-indicator-sw';
  indicator.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: #0f0;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 11px;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    border: 1px solid #0f0;
  `;
  indicator.textContent = '🔄 ' + VERSION;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 5000);
  });

})();
