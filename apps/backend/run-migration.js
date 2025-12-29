require('dotenv').config();
const fs = require('fs');
const path = require('path');
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10));
}
const { query } = require('./src/config/database');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'src/database/migrations/20251229_standardize_doc_types.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Running ${statements.length} migration statements...`);
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement}`);
        await query(statement);
      } catch (err) {
        const errorMsg = `Statement failed: ${statement}\nError: ${err.message}\n${err.stack}`;
        console.error(errorMsg);
        fs.writeFileSync('migration_error.txt', errorMsg);
        throw err;
      }
    }
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
