const { execSync } = require('child_process');
const path = require('path');

console.log('Running database migrations...');

try {
  execSync('node src/database/migrate.js', {
    cwd: path.join(__dirname, '../apps/backend'),
    stdio: 'inherit'
  });
  console.log('Migrations completed successfully.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
