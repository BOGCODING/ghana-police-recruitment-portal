const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Secrets Scan Utility
 * Scans the codebase for high-entropy strings and known patterns
 */
const patterns = [
  /AIza[0-9A-Za-z-_]{35}/, // Google API Key
  /SG\.[0-9A-Za-z-_]{22}\.[0-9A-Za-z-_]{43}/, // SendGrid
  /sk_live_[0-9a-zA-Z]{24}/, // Stripe Live
  /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/, // Slack Tokens
  /['"]?(password|secret|key|token|access_key|secret_key)['"]?\s*[:=]\s*['"]([^'"]+)['"]/gi, // Generic assignment
  /AKIA[0-9A-Z]{16}/, // AWS Access Key ID
  /[0-9a-zA-Z]{40}/, // Generic 40-char secret
];

const ignoredFiles = [
  'node_modules',
  '.git',
  '.next',
  'package-lock.json',
  'pnpm-lock.yaml',
  'secrets-scan.js', // Ignore self
  '.env.example',
  '.env'
];

const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  let violations = 0;

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (ignoredFiles.some(ignored => fullPath.includes(ignored))) return;

    if (stats.isDirectory()) {
      violations += scanDir(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          // Filter out some false positives (e.g. standard UUIDs if pattern is too broad)
          const secret = match[2] || match[0];
          if (secret.length < 8) continue;
          
          logger.warn(`Potential secret detected in ${fullPath} (Line: ${getLineNumber(content, match.index)})`);
          violations++;
        }
      });
    }
  });

  return violations;
};

const getLineNumber = (content, index) => {
  return content.substring(0, index).split('\n').length;
};

const runScan = () => {
  const rootDir = path.join(__dirname, '../../../'); // Project root
  logger.info(`Starting secrets scan from ${rootDir}...`);
  
  const violations = scanDir(rootDir);
  
  if (violations > 0) {
    logger.error(`Secrets scan failed: ${violations} potential leaks found!`);
    // process.exit(1); // Block commit in pre-commit hook if enabled
  } else {
    logger.info('Secrets scan passed!');
  }
};

if (require.main === module) {
  runScan();
}

module.exports = runScan;
