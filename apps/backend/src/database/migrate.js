const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
});

const migrate = async () => {
  const client = await pool.connect();
  
  let currentFile = '';
  try {
    console.log('Starting database migration...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    for (const file of files) {
      currentFile = file;
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`Completed: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error(`Migration failed on file: ${currentFile}`);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Handle reset flag
if (process.argv.includes('--reset')) {
  console.log('Resetting database...');
  // Add reset logic here if needed
}

migrate();
