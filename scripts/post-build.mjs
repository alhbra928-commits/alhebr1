import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔄 Running post-build tasks...\n');

// Allow overriding output directory via OUT_DIR env var (default: dist)
const OUT_DIR = process.env.OUT_DIR || 'dist';

const manifestPath = join(__dirname, '..', 'version-manifest.json');
let version = `v${Date.now()}`;

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  version = manifest.version;
  console.log(`📌 Using version: ${version}`);
}

const outIndexPath = join(__dirname, '..', OUT_DIR, 'index.html');
if (existsSync(outIndexPath)) {
  let content = readFileSync(outIndexPath, 'utf-8');

  // Replace __BUILD_VERSION__ placeholder with actual version
  content = content.replace(/__BUILD_VERSION__/g, version);
  console.log(`✅ Replaced __BUILD_VERSION__ with ${version}`);

  // AUTO RELOAD SYSTEM - FORCES UPDATE
  const swScript = `
    <!-- AUTO RELOAD ON NEW VERSION -->
    <script>
      (function() {
        const VERSION = '${version}';
        console.log('%c✅ منصة النخيل والزيتون', 'color: #10b981; font-size: 16px; font-weight: bold');
        console.log('Build Version:', VERSION);

        const oldVersion = localStorage.getItem('app-version');

        if (oldVersion && oldVersion !== VERSION) {
          console.log('%c🔄 NEW VERSION DETECTED - RELOADING...', 'color: orange; font-weight: bold');
          localStorage.setItem('app-version', VERSION);

          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }

          // Show update message
          const msg = document.createElement('div');
          msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#10b981;color:white;padding:20px 40px;border-radius:12px;font-size:18px;font-weight:bold;z-index:999999';
          msg.innerHTML = '🔄<br>تحديث جديد<br>جارٍ التحديث...';
          document.body.appendChild(msg);

          setTimeout(() => {
            window.location.reload(true);
          }, 1500);

        } else {
          localStorage.setItem('app-version', VERSION);
        }

        // Visual indicator
        const indicator = document.createElement('div');
        indicator.id = 'version-indicator';
        indicator.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:11px;z-index:999999';
        indicator.textContent = VERSION;
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 5000);
        });
      })();
    </script>
  </body>`;

  content = content.replace('</body>', swScript);
  writeFileSync(outIndexPath, content, 'utf-8');
  console.log('✅ Added Service Worker + ultra-aggressive cache prevention to build index.html');

  // Copy and update service-worker.js from public to outDir
  const swPath = join(__dirname, '..', 'public', 'service-worker.js');
  const swDestPath = join(__dirname, '..', OUT_DIR, 'service-worker.js');
  if (existsSync(swPath)) {
    let swContent = readFileSync(swPath, 'utf-8');
    swContent = swContent.replace(/__SW_VERSION__/g, version);
    writeFileSync(swDestPath, swContent, 'utf-8');
    console.log(`✅ Copied and updated service-worker.js with version ${version}`);
  }

  // Copy SW helper files to outDir (if present)
  const swFiles = ['sw-force-update.js', 'register-sw.js'];
  swFiles.forEach(file => {
    const srcPath = join(__dirname, '..', 'public', file);
    const destPath = join(__dirname, '..', OUT_DIR, file);
    if (existsSync(srcPath)) {
      let swContent = readFileSync(srcPath, 'utf-8');
      // Replace version in SW files
      swContent = swContent.replace(/v\d{8}_\d+/g, version);
      writeFileSync(destPath, swContent, 'utf-8');
      console.log(`✅ Copied and updated ${file} to ${OUT_DIR}/`);
    }
  });
} else {
  console.warn(`⚠️  No index.html found in ${OUT_DIR}/ — skipping index post-processing`);
}

// Copy version-manifest.json (if present) into OUT_DIR so post-build features can use it
try {
  const srcManifest = join(__dirname, '..', 'version-manifest.json');
  const destManifest = join(__dirname, '..', OUT_DIR, 'version-manifest.json');
  if (existsSync(srcManifest)) {
    copyFileSync(srcManifest, destManifest);
    console.log('✅ Copied version-manifest.json to build output');
  }
} catch (error) {
  console.warn('⚠️ Could not copy version-manifest.json:', error.message);
}

// Create CDN-compatible _headers file
const headersPath = join(__dirname, '..', OUT_DIR, '_headers');
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

const redirectsPath = join(__dirname, '..', OUT_DIR, '_redirects');
writeFileSync(redirectsPath, '/*    /index.html   200\n');
console.log('✅ Created _redirects file');

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
