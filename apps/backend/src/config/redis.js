const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
    // Limit retries to avoid spamming logs if Redis is down
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 2000);
    }
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  // Suppress error logs if we expected it to fail or during initial connection
  client.on('error', (err) => {
    if (redis === null) return; // Ignore errors if we've already decided Redis is down
    logger.error('Redis client error:', err.message);
  });

  client.on('close', () => {
    if (redis !== null) {
      logger.warn('Redis client connection closed');
    }
  });

  return client;
};

const connectRedis = async () => {
  try {
    const client = createRedisClient();
    // Temporarily assign to check connection
    await client.connect();
    // Verify it actually works (sometimes connect resolves even if not fully ready)
    await client.ping();
    
    redis = client;
    logger.info('Redis connected successfully');
    return redis;
  } catch (error) {
    logger.error('Redis connection failed - continuing without caching:', error.message);
    console.warn('WARNING: Redis connection failed. Rate limiting will fall back to memory store.');
    // Don't throw - Redis is optional
    if (redis) {
      try {
        redis.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    redis = null;
    return null;
  }
};

const getRedis = () => redis;

// Cache helpers
const cacheGet = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

const cacheSet = async (key, value, expirySeconds = 3600) => {
  if (!redis) return false;
  try {
    await redis.setex(key, expirySeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
};

const cacheDelete = async (key) => {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
};

const cacheFlush = async (pattern) => {
  if (!redis) return false;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedis,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheFlush
};
