const Redis = require('ioredis');
const { Redis: UpstashRedis } = require('@upstash/redis');
const logger = require('../utils/logger');

let redis = null;
let upstash = null;

// Initialize Upstash REST if credentials are provided
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstash = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    logger.info('Upstash Redis REST client initialized');
  } catch (error) {
    logger.error('Failed to initialize Upstash Redis REST client:', { 
      message: error.message,
      url: process.env.UPSTASH_REDIS_REST_URL.substring(0, 15) + '...' 
    });
  }
}

const backoffUtils = require('../utils/backoff.utils');

const createRedisClient = () => {
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000, // 10 seconds timeout
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) {
        logger.error('Redis connection retry limit reached (5 attempts)');
        return null;
      }
      return backoffUtils.getExponentialDelay(times, 500, 10000);
    }
  };

  // Support REDIS_URL if provided
  const client = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { 
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: true,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    })
    : new Redis(config);

  client.on('connect', () => logger.info('Redis (TCP) client connected'));
  client.on('ready', () => logger.info('Redis (TCP) client ready'));
  client.on('error', (err) => {
    if (redis === null) return;
    logger.error('Redis (TCP) client error:', err.message);
  });

  return client;
};

const connectRedis = async () => {
  // If we only have Upstash REST and no TCP config, we skip TCP connection
  if (upstash && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
    logger.info('Using Upstash REST for caching. TCP Redis skipped.');
    return upstash;
  }

  try {
    const client = createRedisClient();
    await client.connect();
    await client.ping();
    
    redis = client;
    logger.info('Redis (TCP) connected successfully');
    return redis;
  } catch (error) {
    const redisDesc = process.env.REDIS_URL 
      ? 'URL: ' + process.env.REDIS_URL.split('@')[1] || 'URL starting with ' + process.env.REDIS_URL.substring(0, 10)
      : `Host: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
      
    logger.error(`Redis (TCP) connection failed [${redisDesc}]:`, error.message || error);
    if (upstash) {
      logger.info('Upstash Redis REST client is active (Fallback).');
      return upstash;
    }
    logger.warn('WARNING: Redis (TCP) and Upstash REST both unavailable. Rate limiting will fall back to memory store.');
    redis = null;
    return null;
  }
};

const getRedis = () => redis;
const getUpstash = () => upstash;

// Cache helpers - prioritize Upstash REST then ioredis
const cacheGet = async (key) => {
  const client = upstash || redis;
  if (!client) return null;
  try {
    const data = await client.get(key);
    if (!data) return null;
    // Upstash REST returns parsed JSON for some types, ioredis returns string
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

const cacheSet = async (key, value, expirySeconds = 3600) => {
  const client = upstash || redis;
  if (!client) return false;
  try {
    if (upstash) {
      await upstash.set(key, JSON.stringify(value), { ex: expirySeconds });
    } else {
      await redis.setex(key, expirySeconds, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
};

const cacheDelete = async (key) => {
  const client = upstash || redis;
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
};

const cacheFlush = async (pattern) => {
  if (upstash) {
    logger.warn('Flush by pattern not fully supported on Upstash REST through this helper');
    return false;
  }
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
  getUpstash,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheFlush,
  isUpstash: !!upstash,
  isTcp: !!redis
};
