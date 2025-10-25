#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Smart Cache-Buster Generator
 * Automatically generates unique version identifiers for cache invalidation
 */

function generateCacheBuster() {
  const timestamp = Date.now();
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const version = `v${date}_${timestamp}`;

  console.log('🚀 Starting Cache-Buster Generation...');
  console.log(`📦 Generated Version: ${version}`);

  return version;
}

function updateIndexHtml(version) {
  const indexPath = join(__dirname, '..', 'index.html');

  try {
    let content = readFileSync(indexPath, 'utf-8');

    // Update cache-buster meta tag
    content = content.replace(
      /<meta name="cache-buster" content="[^"]*" \/>/,
      `<meta name="cache-buster" content="${version}" />`
    );

    writeFileSync(indexPath, content, 'utf-8');
    console.log('✅ Updated index.html with new cache-buster');

    return true;
  } catch (error) {
    console.error('❌ Error updating index.html:', error);
    return false;
  }
}

function createVersionManifest(version) {
  const manifestPath = join(__dirname, '..', 'version-manifest.json');

  const manifest = {
    version,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    build: process.env.BUILD_NUMBER || 'local',
    environment: process.env.NODE_ENV || 'production'
  };

  try {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log('✅ Created version manifest');
    return manifest;
  } catch (error) {
    console.error('❌ Error creating manifest:', error);
    return null;
  }
}

function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 SMART CACHE-BUSTER SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const version = generateCacheBuster();
  const htmlUpdated = updateIndexHtml(version);
  const manifest = createVersionManifest(version);

  if (htmlUpdated && manifest) {
    console.log('\n✅ Cache-Buster Generation Complete!');
    console.log(`📌 Version: ${version}`);
    console.log(`🕐 Time: ${new Date().toLocaleString('ar-SA')}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } else {
    console.error('\n❌ Cache-Buster Generation Failed!');
    process.exit(1);
  }
}

main();
