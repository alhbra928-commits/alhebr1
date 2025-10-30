#!/usr/bin/env node

/**
 * INJECT CACHE BUSTERS INTO HTML
 * يُضيف timestamp فريد لكل ملف لإجبار المتصفح على تحميل النسخة الجديدة
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔥 INJECTING AGGRESSIVE CACHE BUSTERS\n');

const distIndexPath = join(__dirname, '..', 'dist', 'index.html');
const timestamp = Date.now();
const cacheBuster = `v=${timestamp}`;

try {
  let html = readFileSync(distIndexPath, 'utf-8');

  // 1. إضافة cache buster لكل <script src="...">
  html = html.replace(
    /<script([^>]*)\ssrc="([^"]+)"/g,
    (match, attrs, src) => {
      // تجاهل external scripts
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return match;
      }

      // إضافة cache buster
      const separator = src.includes('?') ? '&' : '?';
      const newSrc = `${src}${separator}${cacheBuster}`;
      return `<script${attrs} src="${newSrc}"`;
    }
  );

  // 2. إضافة cache buster لكل <link href="...">
  html = html.replace(
    /<link([^>]*)\shref="([^"]+)"/g,
    (match, attrs, href) => {
      // تجاهل external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return match;
      }

      // إضافة cache buster للـ CSS فقط
      if (attrs.includes('stylesheet') || href.endsWith('.css')) {
        const separator = href.includes('?') ? '&' : '?';
        const newHref = `${href}${separator}${cacheBuster}`;
        return `<link${attrs} href="${newHref}"`;
      }

      return match;
    }
  );

  // 3. إضافة meta tag للإجبار على عدم التخزين المؤقت
  const metaTags = `
    <!-- AGGRESSIVE CACHE PREVENTION -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="cache-control" content="no-cache">
    <meta name="build-timestamp" content="${timestamp}">
    <meta name="last-deployment" content="${new Date().toISOString()}">
  `;

  // إضافة قبل </head>
  html = html.replace('</head>', `${metaTags}\n  </head>`);

  // 4. إضافة script في البداية لحذف كل الكاش
  const clearCacheScript = `
    <script>
      // 🔥 IMMEDIATE CACHE CLEARING ON EVERY PAGE LOAD
      (function() {
        'use strict';

        const BUILD_TIMESTAMP = ${timestamp};
        const LAST_BUILD = localStorage.getItem('last-build-timestamp');

        // إذا كان هناك build جديد
        if (LAST_BUILD && parseInt(LAST_BUILD) !== BUILD_TIMESTAMP) {
          console.log('%c🔥 NEW BUILD DETECTED - CLEARING ALL CACHES', 'color: red; font-size: 16px; font-weight: bold');
          console.log('  Previous Build:', new Date(parseInt(LAST_BUILD)).toLocaleString());
          console.log('  Current Build:', new Date(BUILD_TIMESTAMP).toLocaleString());

          // 1. حذف كل localStorage
          const keysToKeep = ['last-build-timestamp'];
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
              localStorage.removeItem(key);
            }
          });

          // 2. حذف كل sessionStorage
          sessionStorage.clear();

          // 3. حذف كل Service Workers
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              registrations.forEach(reg => {
                console.log('  Unregistering SW:', reg.scope);
                reg.unregister();
              });
            });
          }

          // 4. حذف كل Cache Storage
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                console.log('  Deleting cache:', name);
                caches.delete(name);
              });
            });
          }

          // 5. تحديث timestamp
          localStorage.setItem('last-build-timestamp', BUILD_TIMESTAMP);

          console.log('%c✅ ALL CACHES CLEARED - RELOADING...', 'color: green; font-size: 14px; font-weight: bold');

          // 6. إعادة تحميل إجبارية بعد 500ms
          setTimeout(() => {
            window.location.reload(true);
          }, 500);
        } else if (!LAST_BUILD) {
          // أول مرة
          console.log('%c🎉 FIRST TIME VISIT - BUILD ${timestamp}', 'color: blue; font-size: 14px');
          localStorage.setItem('last-build-timestamp', BUILD_TIMESTAMP);
        } else {
          // نفس الـ build
          console.log('%c✅ BUILD UP-TO-DATE', 'color: green; font-size: 12px');
        }
      })();
    </script>
  `;

  // إضافة بعد <head>
  html = html.replace('<head>', `<head>\n${clearCacheScript}`);

  // حفظ الملف
  writeFileSync(distIndexPath, html);

  console.log('✅ Cache busters injected successfully');
  console.log(`📦 Timestamp: ${timestamp}`);
  console.log(`📅 Date: ${new Date(timestamp).toLocaleString('ar-SA')}`);
  console.log('\n🎯 Every asset now has unique cache buster');
  console.log('🔥 Old caches will be deleted automatically\n');

} catch (error) {
  console.error('❌ Failed to inject cache busters:', error.message);
  process.exit(1);
}
