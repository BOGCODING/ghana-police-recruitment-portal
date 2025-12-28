const fs = require('fs');
const path = require('path');

// Sleep for 2 seconds to let Next.js release handles
console.log('Waiting for build processes to release handles...');
const buildCoolDown = Date.now();
while (Date.now() - buildCoolDown < 2000) {}

function copyWithRetry(src, dest, isDir, retries = 5) {
  try {
    if (isDir) {
      if (fs.cpSync) {
        fs.cpSync(src, dest, { recursive: true, force: true });
      } else {
        // Fallback for older node
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (err) {
    if (err.code === 'EPERM' && retries > 0) {
      console.warn(`Retrying ${isDir ? 'dir' : 'file'} copy to ${dest} (${retries} retries left)...`);
      const start = Date.now();
      while (Date.now() - start < 500) {}
      return copyWithRetry(src, dest, isDir, retries - 1);
    }
    throw err;
  }
}

const appName = process.argv[2];
if (!appName) {
  console.error('Please provide app name (frontend or admin)');
  process.exit(1);
}

const baseDir = path.join(__dirname, '..', 'apps', appName);
const standaloneDir = path.join(baseDir, '.next', 'standalone', 'apps', appName);

console.log(`Copying static files for ${appName} into ${standaloneDir}...`);

// Copy public folder
const publicSrc = path.join(baseDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  copyWithRetry(publicSrc, publicDest, true);
  console.log('Copied public folder');
}

// Copy static folder
const staticSrc = path.join(baseDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  copyWithRetry(staticSrc, staticDest, true);
  console.log('Copied .next/static folder');
}

console.log('Done!');
