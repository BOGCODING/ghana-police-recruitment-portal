const { execSync } = require('child_process');
const path = require('path');

console.log('Seeding initial data...');

try {
  execSync('npm run seed', {
    cwd: path.join(__dirname, '../apps/backend'),
    stdio: 'inherit'
  });
  console.log('Seeding completed.');
} catch (error) {
  console.error('Seeding failed:', error.message);
  process.exit(1);
}
