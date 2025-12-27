const { query } = require('../apps/backend/src/config/database');

async function testConnection() {
  try {
    const res = await query('SELECT NOW()');
    console.log('Database connected successfully at:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    process.exit(1);
  }
}

testConnection();
