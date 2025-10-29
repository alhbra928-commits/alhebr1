import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminUsersStorage } from './modules/admin/services/adminUsersStorage';

// تهيئة نظام المستخدمين عند بداية التطبيق
AdminUsersStorage.initialize();

// تسجيل Service Worker للـ PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ PWA: Service Worker registered successfully');

        // التحقق من التحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 PWA: New version available! Refresh to update.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('⚠️ PWA: Service Worker registration failed:', error);
      });
  });
}

if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
