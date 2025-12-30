const { Pool } = require('pg');
const logger = require('../utils/logger');
const { sanitizeEnv } = require('../utils/helpers');

const databaseUrl = sanitizeEnv(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: databaseUrl,
  max: parseInt(process.env.DB_POOL_MAX) || (process.env.NODE_ENV === 'production' ? 10 : 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: databaseUrl && !databaseUrl.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
  statement_timeout: 5000, // 5 seconds timeout for all queries
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
const SLOW_QUERY_THRESHOLD = 200; // ms

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      logger.warn(`SLOW QUERY DETECTED (${duration}ms): ${text.substring(0, 200)}...`, {
        duration,
        query: text,
        params
      });
    } else {
      logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 100)}...`);
    }

    // Warn on large result sets (Optimization Debt)
    if (result.rowCount > 1000) {
      logger.warn(`LARGE RESULT SET DETECTED (${result.rowCount} rows): Consider adding pagination`, {
        query: text,
        rowCount: result.rowCount
      });
    }
    
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
