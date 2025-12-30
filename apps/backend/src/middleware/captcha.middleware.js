const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHandler');

/**
 * CAPTCHA Verification Middleware
 * Validates the CAPTCHA token provided in the X-Captcha-Token header.
 */
const validateCaptcha = async (req, res, next) => {
  const captchaToken = req.headers['x-captcha-token'];
  const isDev = process.env.NODE_ENV === 'development';
  const secretKey = process.env.CAPTCHA_SECRET;

  // 1. Development Bypass
  if (isDev && req.headers['x-captcha-bypass'] === process.env.CAPTCHA_BYPASS_KEY) {
    logger.info('[Captcha] Development bypass utilized');
    return next();
  }

  // 2. Token Check
  if (!captchaToken) {
    logger.warn(`[Captcha] Missing token from IP: ${req.ip} for route: ${req.originalUrl}`);
    return errorResponse(res, 'CAPTCHA verification required', 403);
  }

  // 3. Optional: Skip if secret key is missing (Graceful degradation for development)
  if (!secretKey) {
    if (isDev) {
      logger.warn('[Captcha] CAPTCHA_SECRET is missing in development. Skipping verification.');
      return next();
    }
    logger.error('[Captcha] CAPTCHA_SECRET is not configured in production!');
    return errorResponse(res, 'Internal security configuration error', 500);
  }

  try {
    // 4. Verify with Provider
    const params = new URLSearchParams({
      secret: secretKey,
      response: captchaToken,
      remoteip: req.ip
    });

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn(`[Captcha] Verification failed for IP: ${req.ip}. Error: ${JSON.stringify(data['error-codes'])}`);
      return errorResponse(res, 'Invalid CAPTCHA token', 403);
    }

    // Success
    logger.debug(`[Captcha] Verified successfully for IP: ${req.ip}`);
    next();
  } catch (error) {
    logger.error('[Captcha] Verification service error:', error.message);
    return errorResponse(res, 'CAPTCHA verification service unavailable', 503);
  }
};

module.exports = {
  validateCaptcha
};
