const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Network Segmentation Middleware
 * Restricts access to sensitive routes to specific CIDR ranges (Internal Network)
 */
const ipWhitelist = (allowedCidrs = []) => {
  return (req, res, next) => {
    // In production, ensure we get the real client IP (e.g., from X-Forwarded-For if behind a proxy)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    // Development fallback
    if (process.env.NODE_ENV === 'development' || clientIp === '::1' || clientIp === '127.0.0.1') {
      return next();
    }

    const isAllowed = allowedCidrs.some(cidr => {
      // Basic implementation for demonstration
      // In a real VPC environment, this would use a CIDR matching library like 'ip-range-check'
      return clientIp.startsWith(cidr.split('/')[0]); 
    });

    if (!isAllowed) {
      logger.warn(`Network Segmentation Violation: IP ${clientIp} attempted to access restricted route ${req.originalUrl}`);
      return errorResponse(res, 'Access denied: Route restricted to internal network only', 403);
    }

    next();
  };
};

module.exports = ipWhitelist;
