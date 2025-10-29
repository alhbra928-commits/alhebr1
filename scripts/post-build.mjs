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
  
  // Add cache clearing script before </body>
  const cacheScript = `
    <!-- Force Cache Clearing Script - Enhanced for Safari iOS -->
    <script>
      (function() {
        const currentVersion = '${version}';
        const storedVersion = localStorage.getItem('app-version');
        const lastUpdate = localStorage.getItem('app-last-update');
        const now = Date.now();

        // Force reload if version changed
        if (storedVersion !== currentVersion) {
          console.log('🔄 NEW VERSION DETECTED!');
          console.log('Old:', storedVersion);
          console.log('New:', currentVersion);

          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(function(names) {
              names.forEach(function(name) {
                caches.delete(name);
                console.log('🗑️ Deleted cache:', name);
              });
            });
          }

          // Unregister service workers
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              registrations.forEach(function(registration) {
                registration.unregister();
                console.log('🗑️ Unregistered SW');
              });
            });
          }

          // Clear session storage too
          sessionStorage.clear();

          // Update version
          localStorage.setItem('app-version', currentVersion);
          localStorage.setItem('app-last-update', now.toString());

          // Force hard reload for Safari
          if (storedVersion) {
            console.log('🔄 FORCING HARD RELOAD...');

            // Safari iOS requires special handling
            if (window.location.reload) {
              // Add timestamp to force cache bypass
              const url = new URL(window.location.href);
              url.searchParams.set('_t', now);
              window.location.href = url.toString();
            }
          }
        } else {
          console.log('✅ App is up to date:', currentVersion);
        }

        // Additional check: Force reload every 24 hours for Safari
        const hoursSinceUpdate = lastUpdate ? (now - parseInt(lastUpdate)) / (1000 * 60 * 60) : 999;
        if (hoursSinceUpdate > 24) {
          console.log('⏰ 24h passed, forcing cache check...');
          localStorage.setItem('app-last-update', now.toString());
        }
      })();
    </script>
  </body>`;
  
  content = content.replace('</body>', cacheScript);
  writeFileSync(distIndexPath, content, 'utf-8');
  console.log('✅ Added cache clearing script to dist/index.html');
}

const headersPath = join(__dirname, '..', 'dist', '_headers');
writeFileSync(headersPath, `/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/index.html
  Cache-Control: no-cache, no-store, must-revalidate

/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate

/version-manifest.json
  Cache-Control: no-cache, no-store, must-revalidate

/assets/*.js
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Cache-Control: public, max-age=31536000, immutable
`);
console.log('✅ Created _headers file');

const redirectsPath = join(__dirname, '..', 'dist', '_redirects');
writeFileSync(redirectsPath, '/*    /index.html   200\n');
console.log('✅ Created _redirects file');

console.log('\n✅ Post-build tasks completed!\n');
