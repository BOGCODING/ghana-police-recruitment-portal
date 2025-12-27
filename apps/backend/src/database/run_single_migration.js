const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const runSingle = async () => {
  const client = await pool.connect();
  const file = '025_rename_columns_to_camelcase.sql';
  try {
    console.log(`Running single migration: ${file}`);
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
    await client.query(sql);
    console.log(`Completed: ${file}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

runSingle();
