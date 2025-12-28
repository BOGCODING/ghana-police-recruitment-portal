const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedis, isTcp } = require('../config/redis');
const logger = require('../utils/logger');

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Get Redis client for distributed rate limiting
const getRedisStore = () => {
  try {
    const redis = getRedis();
    // ONLY use RedisStore if we have a real TCP connection
    if (!redis || !isTcp) {
      if (!isDev) {
        logger.warn('TCP Redis not available for rate limiting, using memory store');
      }
      return undefined; // Falls back to memory store
    }
    
    return new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: 'rl:'
    });
  } catch (error) {
    logger.error('Error creating Redis store, falling back to memory store:', error);
    return undefined;
  }
};

// General API rate limiter - relaxed for the SPA dashboard needs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes (approx 2 requests per second)
  message: {
    success: false,
    message: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    // Note: This relies on Auth middleware being run BEFORE this if we want ID-based limiting
    const key = req.user?.id || req.admin?.id || req.ip;
    return key;
  },
  handler: (req, res, next, options) => {
    logger.warn(`General Rate limit exceeded: ${req.ip} - ${req.originalUrl} - Agent: ${req.headers['user-agent']}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // Dev: 5 min, Prod: 1 hour
  max: isDev ? 100 : 20, // Dev: 100 attempts, Prod: 20 attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip} - ${req.body?.email || 'unknown'}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Strict limiter for voucher validation (prevent brute force)
const voucherLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 15 * 60 * 1000, // Dev: 5 min, Prod: 15 minutes
  max: isDev ? 50 : 5, // Dev: 50 attempts, Prod: 5 attempts per window
  message: {
    success: false,
    message: 'Too many voucher validation attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  handler: (req, res, next, options) => {
    logger.warn(`Voucher rate limit exceeded: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Lenient limiter for public read-only endpoints
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore()
});

// Strict limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // Dev: 5 min, Prod: 1 hour
  max: isDev ? 50 : 20, // Dev: 50 uploads, Prod: 20 uploads per window
  message: {
    success: false,
    message: 'Upload limit reached, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res, next, options) => {
    logger.warn(`Upload rate limit exceeded: ${req.user?.id || req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Password reset limiter (very strict)
const passwordResetLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // Dev: 5 min, Prod: 1 hour
  max: isDev ? 20 : 3, // Dev: 20 attempts, Prod: 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  handler: (req, res, next, options) => {
    logger.warn(`Password reset rate limit exceeded: ${req.ip} - ${req.body?.email || 'unknown'}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Create a custom limiter with specific options
const createLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store: getRedisStore(),
    message: {
      success: false,
      message: options.message || 'Rate limit exceeded'
    },
    ...options
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  voucherLimiter,
  publicLimiter,
  uploadLimiter,
  passwordResetLimiter,
  createLimiter
};
