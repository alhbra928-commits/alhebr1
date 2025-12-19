// Service Worker DISABLED for PING Testing
// معطّل مؤقتاً لاختبار نظام PING البسيط
(function() {
  'use strict';

  console.log('%c⚠️ SERVICE WORKER DISABLED', 'color: #ff0; font-size: 16px; font-weight: bold');
  console.log('Testing Simple PING System - No caching');

  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Unregister ALL existing service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        if (success) {
          console.log('✅ Unregistered Service Worker:', registration.scope);
        }
      });
    }
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName).then(function(success) {
          if (success) {
            console.log('🗑️ Deleted cache:', cacheName);
          }
        });
      });
    });
  }

  console.log('✅ Service Worker cleanup complete');

})();
