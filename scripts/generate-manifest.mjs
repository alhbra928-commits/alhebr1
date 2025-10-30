import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateSHA256(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.css') || item.endsWith('.html'))) {
      const relativePath = relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }
  
  return files;
}

console.log('🔐 Generating Atomic Deployment Manifest...');

const distPath = join(__dirname, '..', 'dist');
const now = new Date();
const version = `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

const manifest = {
  version,
  timestamp: now.toISOString(),
  buildNumber: Date.now(),
  channel: process.env.DEPLOYMENT_CHANNEL || 'blue',
  files: {},
  integrity: {
    algorithm: 'sha256',
    verified: true
  },
  deployment: {
    strategy: 'atomic',
    rollbackEnabled: true,
    cdnPurgeRequired: true
  }
};

console.log(`📦 Version: ${version}`);
console.log(`🔵 Channel: ${manifest.channel}`);
console.log('📂 Scanning files...');

const allFiles = getAllFiles(distPath);

console.log(`📄 Found ${allFiles.length} files to hash`);

let processed = 0;
for (const file of allFiles) {
  const fullPath = join(distPath, file);
  const hash = generateSHA256(fullPath);
  const size = statSync(fullPath).size;
  
  manifest.files[file] = {
    hash: `sha256-${hash}`,
    size,
    path: `/${file.replace(/\\/g, '/')}`
  };
  
  processed++;
  if (processed % 10 === 0) {
    console.log(`  ✓ Processed ${processed}/${allFiles.length} files...`);
  }
}

console.log(`✅ Processed all ${allFiles.length} files`);

// Generate manifest hash
const manifestContent = JSON.stringify(manifest, null, 2);
const manifestHash = createHash('sha256').update(manifestContent).digest('hex');

manifest.manifestHash = `sha256-${manifestHash}`;

// Write manifest
const manifestPath = join(distPath, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Written manifest.json (${manifestContent.length} bytes)`);

// Write version.txt
const versionPath = join(distPath, 'version.txt');
writeFileSync(versionPath, version);
console.log(`✅ Written version.txt`);

// Write deployment info
const deploymentInfo = {
  version,
  timestamp: now.toISOString(),
  channel: manifest.channel,
  filesCount: allFiles.length,
  manifestHash: manifest.manifestHash
};

const deploymentInfoPath = join(distPath, 'deployment-info.json');
writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
console.log(`✅ Written deployment-info.json`);

console.log('\n🎉 Atomic Deployment Manifest Generated Successfully!');
console.log(`📦 Version: ${version}`);
console.log(`🔐 Manifest Hash: ${manifest.manifestHash.substring(0, 16)}...`);
console.log(`📊 Total Files: ${allFiles.length}`);
