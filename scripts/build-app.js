const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appName = process.argv[2];
if (!appName) {
  console.error('Please provide app name (frontend or admin)');
  process.exit(1);
}

const baseDir = path.join(__dirname, '..', 'apps', appName);
const isWindows = process.platform === 'win32';

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${command} ${args.join(' ')} in ${cwd}...`);
    const proc = spawn(command, args, { 
      cwd, 
      shell: true,
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      // robocopy returns 1 on success (files copied)
      if (command === 'robocopy' && code <= 3) resolve();
      else if (code === 0) resolve();
      else reject(new Error(`${command} failed with code ${code}`));
    });
  });
}

async function copyFolder(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (isWindows) {
    console.log(`Using robocopy to copy ${src} to ${dest}...`);
    try {
      execSync(`robocopy "${src}" "${dest}" /E /R:5 /W:1 /NP`, { stdio: 'inherit' });
    } catch (err) {
      // robocopy returns non-zero even on success sometimes
      if (err.status > 3) throw err;
    }
  } else {
    console.log(`Using fs.cpSync to copy ${src} to ${dest}...`);
    fs.cpSync(src, dest, { recursive: true, force: true });
  }
}

async function build() {
  try {
    // 1. Run next build
    await runCommand('pnpm', ['exec', 'next', 'build'], baseDir);

    // 2. Cool down
    console.log('Build finished. Waiting for handles to release...');
    await new Promise(r => setTimeout(r, 2000));

    // 3. Copy static files
    const standaloneDir = path.join(baseDir, '.next', 'standalone', 'apps', appName);
    console.log(`Copying static files into ${standaloneDir}...`);

    const publicSrc = path.join(baseDir, 'public');
    const publicDest = path.join(standaloneDir, 'public');
    await copyFolder(publicSrc, publicDest);

    const staticSrc = path.join(baseDir, '.next', 'static');
    const staticDest = path.join(standaloneDir, '.next', 'static');
    await copyFolder(staticSrc, staticDest);

    console.log('Unified build and copy completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
