const winston = require('winston');
const path = require('path');

const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = ['password', 'token', 'pin', 'voucherCode', 'resetToken'];
  
  const mask = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const shaded = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        shaded[key] = '********';
      } else if (typeof value === 'object') {
        shaded[key] = mask(value);
      } else {
        shaded[key] = value;
      }
    }
    return shaded;
  };

  if (typeof info.message === 'object') {
    info.message = mask(info.message);
  }
  
  // Also scan interpolation arguments if they exist
  const splat = info[Symbol.for('splat')];
  if (splat) {
    info[Symbol.for('splat')] = splat.map(arg => mask(arg));
  }

  return info;
});

const logFormat = winston.format.combine(
  maskSensitiveData(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const output = typeof message === 'object' ? JSON.stringify(message) : message;
    return `${timestamp} [${level.toUpperCase()}]: ${stack || output}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Create debug method if not exists
if (process.env.NODE_ENV === 'development') {
  logger.debug = logger.debug || logger.info;
}

module.exports = logger;
