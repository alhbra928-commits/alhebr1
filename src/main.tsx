import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminUsersStorage } from './modules/admin/services/adminUsersStorage';

// 🔍 DIAGNOSTIC MODE - Show what's happening
console.log('%c🚀 منصة النخيل والزيتون - Starting...', 'color: #10b981; font-size: 16px; font-weight: bold');
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Found' : '⚠️ Using Fallback');
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '⚠️ Using Fallback');

// تهيئة نظام المستخدمين عند بداية التطبيق
try {
  AdminUsersStorage.initialize();
  console.log('✅ AdminUsersStorage initialized');
} catch (error) {
  console.error('❌ AdminUsersStorage initialization failed:', error);
}

// 🔥 AGGRESSIVE SERVICE WORKER - Forces fresh content
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('%c✅ Service Worker registered', 'color:#10b981;font-weight:bold');

        // Check for updates every 30 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 30000);

        // Force update on SW message
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_ACTIVATED') {
            console.log('%c🔥 Service Worker activated - NEW VERSION!', 'color:#ef4444;font-size:16px;font-weight:bold');
            console.log('%cVersion:', 'color:#3b82f6', event.data.version);

            if (event.data.action === 'FORCE_RELOAD') {
              console.log('%c🚀 Force reloading to apply updates...', 'color:#8b5cf6;font-weight:bold');

              // Clear caches and reload
              if ('caches' in window) {
                caches.keys().then(names => {
                  return Promise.all(names.map(name => caches.delete(name)));
                }).then(() => {
                  setTimeout(() => window.location.reload(), 500);
                });
              } else {
                setTimeout(() => window.location.reload(), 500);
              }
            }
          }
        });
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error);
      });
  });
}

// TEMPORARILY DISABLED FOR DEBUGGING
// if (import.meta.env.PROD) {
//   console.log = () => {};
//   console.warn = () => {};
//   console.info = () => {};
// }

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Global Error:', event.error);
  console.error('  Message:', event.message);
  console.error('  Filename:', event.filename);
  console.error('  Line:', event.lineno, 'Column:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('✅ Root element found, creating React root...');

  // Force body styles for mobile footer fix
  document.body.style.position = 'relative';
  document.body.style.overflow = 'visible';
  document.body.style.height = 'auto';
  document.body.style.minHeight = '100vh';

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('✅ React app rendered successfully!');
} catch (error) {
  console.error('❌ Failed to render app:', error);

  // Show user-friendly error
  document.body.innerHTML = `
    <div style="font-family: Arial; padding: 50px; text-align: center; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style="font-size: 3em; margin-bottom: 20px;">⚠️ خطأ في التحميل</h1>
      <p style="font-size: 1.5em; margin-bottom: 30px;">حدث خطأ أثناء تحميل المنصة</p>
      <div style="background: rgba(255,255,255,0.2); padding: 30px; border-radius: 15px; max-width: 600px;">
        <h3>الرجاء:</h3>
        <p style="font-size: 1.2em; line-height: 2; margin-top: 20px;">
          1. اضغط F12 وانظر إلى Console<br>
          2. خذ سكرين شوت للأخطاء<br>
          3. أرسلها للدعم الفني
        </p>
      </div>
      <a href="/اقرأني.html" style="background: white; color: #dc2626; padding: 20px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 30px; display: inline-block;">
        📖 دليل حل المشاكل
      </a>
    </div>
  `;
}
