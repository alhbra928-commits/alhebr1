import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔄 Running post-build tasks...\n');

const manifestPath = join(__dirname, '..', 'version-manifest.json');
let version = `v${Date.now()}`;

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  version = manifest.version;
  console.log(`📌 Using version: ${version}`);
}

const distIndexPath = join(__dirname, '..', 'dist', 'index.html');
if (existsSync(distIndexPath)) {
  let content = readFileSync(distIndexPath, 'utf-8');

  // Replace __BUILD_VERSION__ placeholder with actual version
  content = content.replace(/__BUILD_VERSION__/g, version);
  console.log(`✅ Replaced __BUILD_VERSION__ with ${version}`);

  // Add Service Worker registration first
  const swScript = `
    <!-- SERVICE WORKER - FORCE UPDATE SYSTEM -->
    <script src="/register-sw.js?v=${version}"></script>

    <!-- ULTRA AGGRESSIVE CACHE CLEARING - BACKUP SOLUTION -->
    <script>
      (function() {
        const VERSION = '${version}';
        const STORAGE_KEY = 'app-version-v2';
        const stored = localStorage.getItem(STORAGE_KEY);

        console.log('%c🔍 CACHE CHECK', 'color: blue; font-size: 16px; font-weight: bold');
        console.log('Current Version:', VERSION);
        console.log('Stored Version:', stored);

        if (stored !== VERSION) {
          console.log('%c🔥 NEW VERSION - CLEARING EVERYTHING!', 'color: red; font-size: 20px; font-weight: bold');

          // 1. Clear ALL caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name);
                console.log('🗑️ Deleted cache:', name);
              });
            });
          }

          // 2. Unregister ALL service workers
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
              regs.forEach(reg => {
                reg.unregister();
                console.log('🗑️ Unregistered SW');
              });
            });
          }

          // 3. Clear ALL storage (except auth)
          const authKeys = ['admin-session', 'investor-session', 'farm-owner-session'];
          const authData = {};
          authKeys.forEach(key => {
            if (localStorage.getItem(key)) {
              authData[key] = localStorage.getItem(key);
            }
          });

          localStorage.clear();
          sessionStorage.clear();

          // Restore auth
          Object.keys(authData).forEach(key => {
            localStorage.setItem(key, authData[key]);
          });

          // 4. Set new version
          localStorage.setItem(STORAGE_KEY, VERSION);

          // 5. Force hard reload with cache bypass
          if (stored) {
            console.log('%c🔄 FORCING HARD RELOAD...', 'color: orange; font-size: 18px; font-weight: bold');
            setTimeout(() => {
              window.location.href = window.location.origin + window.location.pathname + '?v=' + VERSION + '&t=' + Date.now();
            }, 100);
          }
        } else {
          console.log('%c✅ UP TO DATE', 'color: green; font-size: 16px; font-weight: bold');
        }

        // Visual indicator
        const indicator = document.createElement('div');
        indicator.id = 'version-indicator';
        indicator.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:11px;z-index:999999;';
        indicator.textContent = VERSION;
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 5000);
        });
      })();
    </script>
  </body>`;

  content = content.replace('</body>', swScript);
  writeFileSync(distIndexPath, content, 'utf-8');
  console.log('✅ Added Service Worker + ultra-aggressive cache prevention to dist/index.html');

  // Copy and update service-worker.js
  const swPath = join(__dirname, '..', 'public', 'service-worker.js');
  const swDestPath = join(__dirname, '..', 'dist', 'service-worker.js');
  if (existsSync(swPath)) {
    let swContent = readFileSync(swPath, 'utf-8');
    swContent = swContent.replace(/__SW_VERSION__/g, version);
    writeFileSync(swDestPath, swContent, 'utf-8');
    console.log(`✅ Copied and updated service-worker.js with version ${version}`);
  }

  // Copy SW files to dist
  const swFiles = ['sw-force-update.js', 'register-sw.js'];
  swFiles.forEach(file => {
    const srcPath = join(__dirname, '..', 'public', file);
    const destPath = join(__dirname, '..', 'dist', file);
    if (existsSync(srcPath)) {
      let swContent = readFileSync(srcPath, 'utf-8');
      // Replace version in SW files
      swContent = swContent.replace(/v\d{8}_\d+/g, version);
      writeFileSync(destPath, swContent, 'utf-8');
      console.log(`✅ Copied and updated ${file} to dist/`);
    }
  });
}

// Create CDN-compatible _headers file
const headersPath = join(__dirname, '..', 'dist', '_headers');
writeFileSync(headersPath, `# ULTRA AGGRESSIVE CACHE PREVENTION FOR CDN/PREVIEW
# Compatible with Netlify, Vercel, Cloudflare, etc.

# HTML files - NEVER CACHE (for immediate updates)
/*.html
  Cache-Control: no-cache, no-store, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0
  Pragma: no-cache
  Expires: -1
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Vary: *

/index.html
  Cache-Control: no-cache, no-store, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0
  Pragma: no-cache
  Expires: -1
  X-Version: ${version}
  Last-Modified: ${new Date().toUTCString()}
  Vary: *

# Service Worker files - NEVER CACHE
/sw-force-update.js
  Cache-Control: no-cache, no-store, must-revalidate, s-maxage=0, max-age=0
  Service-Worker-Allowed: /
  Vary: *

/register-sw.js
  Cache-Control: no-cache, no-store, must-revalidate, s-maxage=0, max-age=0
  Vary: *

/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate, s-maxage=0, max-age=0
  Vary: *

/version-manifest.json
  Cache-Control: no-cache, no-store, must-revalidate, s-maxage=0, max-age=0
  Content-Type: application/json
  Vary: *

# Assets can be cached (they have hash in filename)
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Cache-Control: public, max-age=31536000, immutable
`);
console.log('✅ Created ultra-aggressive _headers file');

const redirectsPath = join(__dirname, '..', 'dist', '_redirects');
writeFileSync(redirectsPath, '/*    /index.html   200\n');
console.log('✅ Created _redirects file');

// Generate Atomic Deployment Manifest
console.log('\n🔐 Generating Atomic Deployment Manifest...\n');
try {
  const { execSync } = await import('child_process');
  execSync('node scripts/generate-manifest.mjs', { stdio: 'inherit' });
  console.log('✅ Manifest generation completed');
} catch (error) {
  console.error('❌ Manifest generation failed:', error.message);
}

console.log('\n✅ Post-build tasks completed!\n');
console.log(`📦 Version: ${version}\n`);
