const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Composite Security Middleware
 * Validates a combination of:
 * 1. IP Address
 * 2. User/Admin Session
 * 3. Device (User-Agent)
 * 4. Internal API Key
 */
const validateSecurityCombo = (req, res, next) => {
  const clientIp = req.ip;
  const userAgent = req.headers['user-agent'];
  const apiKey = req.headers['x-internal-api-key'];
  const user = req.user || req.admin;

  // 1. IP Check (Basic presence check)
  if (!clientIp) {
    logger.warn('Security Combo Violation: Missing Client IP');
    return errorResponse(res, 'Security check failed: IP identification required', 403);
  }

  // 2. User Check
  if (!user) {
    logger.warn(`Security Combo Violation: Unauthenticated access attempt from IP ${clientIp}`);
    return errorResponse(res, 'Security check failed: Authentication required', 401);
  }

  // 3. Device Check (User-Agent)
  if (!userAgent || userAgent.length < 10) {
    logger.warn(`Security Combo Violation: Suspicious User-Agent from User ${user.id} at IP ${clientIp}`);
    return errorResponse(res, 'Security check failed: Valid device identifier required', 403);
  }

  // 4. API Key Check
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (!internalApiKey || apiKey !== internalApiKey) {
    logger.error(`Security Combo Violation: Invalid/Missing API Key from User ${user.id} at IP ${clientIp}`);
    return errorResponse(res, 'Security check failed: Internal API Key required', 403);
  }

  // Success - All factors validated
  logger.info(`Security Combo Verified: User ${user.id} via ${clientIp}`);
  next();
};

module.exports = {
  validateSecurityCombo
};
