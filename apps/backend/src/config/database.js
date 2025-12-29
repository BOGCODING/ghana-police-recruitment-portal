const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
});

// Test connection
const connectDatabase = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info(`Database connected at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    throw error;
  }
};

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 100)}...`);
    return result;
  } catch (error) {
    logger.error(`Query error: ${error.message}`, { stack: error.stack, text });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get client for manual transaction management
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  pool,
  query,
  transaction,
  getClient,
  connectDatabase
};
