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

    // DISABLED: No automatic updates (prevents reload loop)
    // Only check on page load, not every 30 seconds

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
    console.log('%c✅ NEW SERVICE WORKER ACTIVATED', 'color: #0f0; font-size: 16px; font-weight: bold');
    // NO RELOAD - let user continue browsing
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
        console.log('%c✨ NEW VERSION AVAILABLE: ' + serverVersion, 'color: #0ff; font-size: 16px; font-weight: bold');

        // Just update the version - NO CACHE CLEARING, NO RELOAD
        localStorage.setItem('app-version-v3', serverVersion);

        // Show friendly notification (no forced reload)
        if (storedVersion) {
          showUpdateBanner();
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
