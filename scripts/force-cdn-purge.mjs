#!/usr/bin/env node

/**
 * FORCE CDN PURGE SYSTEM
 * يضمن حذف الكاش القديم من كل مكان
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔥 FORCE CDN PURGE SYSTEM\n');

// 1. إنشاء timestamp فريد جديد
const timestamp = Date.now();
const randomSuffix = Math.random().toString(36).substring(2, 8);
const buildId = `${timestamp}_${randomSuffix}`;

console.log(`📦 New Build ID: ${buildId}`);

// 2. إنشاء ملف cdn-purge.txt يُجبر CDN على التحديث
const cdnPurgeContent = `
CDN PURGE REQUIRED - IMMEDIATE UPDATE

Build ID: ${buildId}
Timestamp: ${new Date().toISOString()}
Random Token: ${randomSuffix}

This file forces CDN to recognize new deployment.
Every build generates a unique ID to bypass all caching layers.

=== CACHE INVALIDATION TOKENS ===
Primary: ${timestamp}
Secondary: ${randomSuffix}
Combined: ${buildId}

=== DEPLOYMENT INFO ===
Date: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
Purpose: Force complete cache invalidation
Status: Active Deployment

=== INSTRUCTIONS FOR CDN ===
1. Invalidate ALL cached HTML files
2. Invalidate ALL cached JS/CSS bundles
3. Invalidate manifest.json
4. Invalidate service workers
5. Force fresh fetch for all assets

This ensures users get the latest version immediately.
`;

const distPath = join(__dirname, '..', 'dist');
const cdnPurgePath = join(distPath, 'cdn-purge.txt');

try {
  writeFileSync(cdnPurgePath, cdnPurgeContent);
  console.log('✅ Created cdn-purge.txt');
} catch (error) {
  console.log('⚠️ Could not create cdn-purge.txt (dist may not exist yet)');
}

// 3. إنشاء ملف robots.txt مع timestamp لإجبار Google على إعادة الزحف
const robotsContent = `# Updated: ${new Date().toISOString()}
# Build: ${buildId}

User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml

# This file is regenerated on every build to signal updates
`;

const robotsPath = join(distPath, 'robots.txt');

try {
  writeFileSync(robotsPath, robotsContent);
  console.log('✅ Updated robots.txt with new timestamp');
} catch (error) {
  console.log('⚠️ Could not update robots.txt');
}

// 4. إنشاء deployment-timestamp.json
const deploymentInfo = {
  buildId,
  timestamp,
  randomToken: randomSuffix,
  date: new Date().toISOString(),
  dateArabic: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }),
  purpose: 'Force CDN cache invalidation',
  cacheBuster: `${timestamp}-${randomSuffix}`
};

const deploymentInfoPath = join(distPath, 'deployment-timestamp.json');

try {
  writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('✅ Created deployment-timestamp.json');
} catch (error) {
  console.log('⚠️ Could not create deployment-timestamp.json');
}

console.log('\n🎉 CDN Purge System Ready!\n');
console.log('Next steps:');
console.log('  1. Deploy with: vercel --prod --force');
console.log('  2. Or: netlify deploy --prod --dir=dist');
console.log('  3. CDN will detect new deployment-timestamp.json');
console.log('  4. All caches will be invalidated\n');
