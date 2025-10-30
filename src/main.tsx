import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminUsersStorage } from './modules/admin/services/adminUsersStorage';
import atomicDeploymentService from './services/atomicDeploymentService';

// تهيئة نظام المستخدمين عند بداية التطبيق
AdminUsersStorage.initialize();

// ⚛️ ATOMIC DEPLOYMENT SYSTEM - Enterprise Grade
// Automatically handles updates with integrity verification and rollback
if (import.meta.env.PROD) {
  console.log('%c⚛️ ATOMIC DEPLOYMENT SYSTEM ACTIVE', 'color: #4ec9b0; font-size: 16px; font-weight: bold');
  console.log('🔐 Security: Enterprise Grade');
  console.log('📦 Strategy: Atomic with Auto-Rollback');
  console.log('🔄 Updates: Automatic');

  // Atomic Deployment Service Worker is registered automatically
  // It will:
  // 1. Monitor for new versions every 30 seconds
  // 2. Verify file integrity with SHA256
  // 3. Clear all caches automatically
  // 4. Reload with new version only if verification passes
  // 5. Rollback to previous version if integrity check fails

  // Expose service for debugging
  (window as any).__atomicDeployment__ = atomicDeploymentService;

  // Log current deployment info
  const deploymentInfo = atomicDeploymentService.getDeploymentInfo();
  if (deploymentInfo.version) {
    console.log(`📦 Current Version: ${deploymentInfo.version}`);
    console.log(`🔵 Channel: ${deploymentInfo.channel || 'unknown'}`);
    console.log(`⏰ Deployed: ${deploymentInfo.timestamp ? new Date(deploymentInfo.timestamp).toLocaleString('ar-SA') : 'unknown'}`);
  }
} else {
  // Development mode - register standard PWA service worker
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ DEV: Service Worker registered');
        })
        .catch((error) => {
          console.warn('⚠️ DEV: Service Worker registration failed:', error);
        });
    }
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
