const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Environment Variable Validator
 * Ensures all required secrets and configuration keys are present
 */
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
  const envExamplePath = path.join(__dirname, '../../../.env.example');
  
  logger.info('Validating environment variables...');

  if (!fs.existsSync(envPath)) {
    logger.error('.env file is missing!');
    if (!fs.existsSync(envExamplePath)) {
      logger.warn('.env.example is also missing.');
    }
    return false;
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

  logger.info('Environment validation passed!');
  return true;
};

if (require.main === module) {
  validateEnv();
}

module.exports = validateEnv;
