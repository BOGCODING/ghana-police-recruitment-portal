const { Pool } = require('pg');
const logger = require('../utils/logger');
const { sanitizeEnv } = require('../utils/helpers');

const databaseUrl = sanitizeEnv(process.env.DATABASE_URL);

// Track database ready state
let isDbReady = false;

const pool = new Pool({
  connectionString: databaseUrl,
  max: parseInt(process.env.DB_POOL_MAX) || (process.env.NODE_ENV === 'production' ? 10 : 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15s for Render cold starts
  ssl: databaseUrl && !databaseUrl.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
  statement_timeout: 30000, // 30 seconds for cold start scenarios
});

// CRITICAL: Handle pool errors to prevent worker crashes
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error (non-fatal):', err.message);
  isDbReady = false;
  // Do NOT exit - let the pool recover
});

pool.on('connect', () => {
  isDbReady = true;
  logger.debug('PostgreSQL pool: new client connected');
});

// Test connection with retry logic
const connectDatabase = async (retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      isDbReady = true;
      logger.info(`Database connected at ${result.rows[0].now} (attempt ${attempt})`);
      return true;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        logger.error('All database connection attempts failed. Running in degraded mode.');
        isDbReady = false;
        // Don't throw - allow server to start without DB
        return false;
      }
    }
  }
  return false;
};

// Query helper with graceful degradation
const SLOW_QUERY_THRESHOLD = 200; // ms

const query = async (text, params) => {
  // If DB is known to be down, fail fast
  if (!isDbReady && !databaseUrl) {
    throw new Error('Database not configured');
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Mark as ready if query succeeds
    if (!isDbReady) {
      isDbReady = true;
      logger.info('Database connection recovered');
    }
    
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
    // Mark DB as potentially down
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      isDbReady = false;
    }
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

// Check if database is ready
const isDatabaseReady = () => isDbReady;

module.exports = {
  pool,
  query,
  transaction,
  getClient,
  connectDatabase,
  isDatabaseReady
};

