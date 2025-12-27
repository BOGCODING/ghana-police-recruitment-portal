const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom tokens
morgan.token('request-id', (req) => req.headers['x-request-id'] || '-');
morgan.token('user-id', (req) => req.user?.id || req.admin?.id || '-');
morgan.token('user-type', (req) => {
  if (req.admin) return 'admin';
  if (req.user) return 'applicant';
  return 'anonymous';
});
morgan.token('body', (req) => {
  // Only log body for non-sensitive routes and in development
  if (process.env.NODE_ENV === 'production') return '-';
  if (req.originalUrl.includes('password') || req.originalUrl.includes('login')) return '[REDACTED]';
  return req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body).substring(0, 200) : '-';
});

// Development format - colorized and detailed
const devFormat = ':method :url :status :response-time ms - :res[content-length] [:user-type/:user-id]';

// Production format - structured for log aggregation
const prodFormat = ':remote-addr - :user-type/:user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :request-id';

// Skip function - filter out unwanted requests
const skip = (req, res) => {
  // Skip health check endpoints (only if successful)
  if ((req.originalUrl === '/health' || req.originalUrl === '/api/health') && res.statusCode < 400) {
    return true;
  }
  
  // Skip static files and assets (only successful responses)
  if (req.originalUrl.match(/\.(ico|png|jpg|jpeg|gif|css|js|map|woff|woff2|ttf)$/) && res.statusCode < 400) {
    return true;
  }
  
  // Skip OPTIONS preflight requests in production
  if (process.env.NODE_ENV === 'production' && req.method === 'OPTIONS') {
    return true;
  }
  
  // Skip successful 304 Not Modified responses (cache hits)
  if (res.statusCode === 304) {
    return true;
  }
  
  return false;
};

// Create middleware based on environment
const createLoggerMiddleware = () => {
  const format = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;
  
  return morgan(format, {
    stream: {
      write: (message) => {
        const trimmedMessage = message.trim();
        
        // Find the status code (usually the 3rd or 4th part depending on format)
        // For devFormat: ':method :url :status :response-time ms' -> status is at index 2
        // For prodFormat: '... "..." :status ...'
        // Simpler approach: Look for 3-digit status code in the message
        const statusMatch = trimmedMessage.match(/\s([1-5]\d{2})\s/);
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : 0;
        
        if (statusCode >= 500) {
          logger.error(trimmedMessage);
        } else if (statusCode >= 400) {
          logger.warn(trimmedMessage);
        } else {
          logger.info(trimmedMessage);
        }
      }
    },
    skip
  });
};

// Export the middleware
const loggerMiddleware = createLoggerMiddleware();

module.exports = loggerMiddleware;
