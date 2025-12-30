const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');
const AlertService = require('../services/alert.service');

/**
 * Custom XSS sanitizer (xss-clean is deprecated)
 * Recursively sanitizes strings in objects
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove script tags and event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data-blocked:')
    .replace(/vbscript:/gi, '')
    .replace(/<iframe/gi, '&lt;iframe')
    .replace(/<object/gi, '&lt;object')
    .replace(/<embed/gi, '&lt;embed')
    .replace(/<base/gi, '&lt;base')
    .replace(/<meta/gi, '&lt;meta')
    .replace(/<link/gi, '&lt;link');
};

const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Also sanitize keys (prevent prototype pollution)
      const sanitizedKey = key.replace(/[$.]/, '_');
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * XSS protection middleware
 */
const xssProtection = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * SQL Injection protection - sanitize common SQL patterns
 */
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
    /(--)|(;)|(\|)|(\\)/g,
    /(\bOR\b|\bAND\b)\s*['"]?.*['"]?\s*=\s*['"]?.*['"]?/gi,
    /SLEEP\s*\(.*\)/gi,
    /WAITFOR\s+DELAY/gi,
    /BENCHMARK\s*\(.*\)/gi,
    /GROUP\s+BY\s+\d+/gi,
    /ORDER\s+BY\s+\d+/gi
  ];
  
  const checkForSqlInjection = (value) => {
    if (typeof value !== 'string') return false;
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const scanObject = (obj, path = '') => {
    if (typeof obj === 'string') {
      if (checkForSqlInjection(obj)) {
        logger.warn(`Potential SQL injection detected at ${path}: ${obj.substring(0, 100)}`);
        return true;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (scanObject(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };
  
  const scanResult = scanObject(req.body, 'body') || scanObject(req.query, 'query');
  
  if (scanResult) {
    AlertService.triggerAlert('SQL_INJECTION_ATTEMPT', {
      ipAddress: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      body: JSON.stringify(req.body).substring(0, 500),
      query: JSON.stringify(req.query).substring(0, 500)
    }, 'CRITICAL');

    return res.status(403).json({
      success: false,
      message: 'Suspicious request activity detected.'
    });
  }
  
  next();
};

/**
 * Trim whitespace from string inputs
 */
const trimStrings = (req, res, next) => {
  const trimObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(trimObject);
    }
    if (typeof obj === 'object' && obj !== null) {
      const trimmed = {};
      for (const [key, value] of Object.entries(obj)) {
        trimmed[key] = trimObject(value);
      }
      return trimmed;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = trimObject(req.body);
  }
  
  next();
};

/**
 * Prevent NoSQL injection (for MongoDB-style queries)
 */
const noSqlInjectionProtection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`NoSQL injection attempt blocked: ${key} in ${req.originalUrl}`);
  }
});

/**
 * Helmet security headers configuration
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      scriptSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      objectSrc: ['\'none\'']
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for API responses
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded by other origins
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  originAgentCluster: true,
  permissionsPolicy: {
    features: {
      camera: ['\'none\''],
      microphone: ['\'none\''],
      geolocation: ['\'none\''],
      payment: ['\'none\''],
      usb: ['\'none\'']
    }
  }
});

/**
 * Combined sanitization middleware array
 */
const sanitize = [
  securityHeaders,
  noSqlInjectionProtection,
  trimStrings,
  xssProtection,
  sqlInjectionProtection
];

/**
 * Individual exports for selective use
 */
module.exports = {
  sanitize,
  securityHeaders,
  xssProtection,
  sqlInjectionProtection,
  noSqlInjectionProtection,
  trimStrings,
  sanitizeString,
  sanitizeObject
};
