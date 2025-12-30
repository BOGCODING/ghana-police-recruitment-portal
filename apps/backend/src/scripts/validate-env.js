const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Sanitize environment variables by removing extra quotes and whitespace
 */
const sanitizeEnv = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const requiredVars = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'FRONTEND_URL',
  'SUPER_ADMIN_EMAIL',
  'SUPER_ADMIN_PASSWORD',
  'INTERNAL_API_KEY',
  'CAPTCHA_SECRET',
  'CAPTCHA_BYPASS_KEY'
];

const validateEnv = () => {
  const envPath = path.join(__dirname, '../../../.env');
  
  logger.info('Validating environment variables...');

  // Sanitize all environment variables in process.env
  Object.keys(process.env).forEach(key => {
    process.env[key] = sanitizeEnv(process.env[key]);
  });

  if (!fs.existsSync(envPath) && process.env.NODE_ENV !== 'production') {
    logger.warn('.env file is missing! (Using process environment variables)');
  }

  const missing = [];
  requiredVars.forEach(v => {
    if (!process.env[v]) {
      missing.push(v);
    }
  });

  if (missing.length > 0) {
    logger.error(`The following required environment variables are missing: ${missing.join(', ')}`);
    return false;
  }

  logger.info('Environment validation passed and sanitized!');
  return true;
};

if (require.main === module) {
  validateEnv();
}

module.exports = validateEnv;
