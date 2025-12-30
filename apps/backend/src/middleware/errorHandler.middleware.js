const logger = require('../utils/logger');
const AlertService = require('../services/alert.service');

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  let { statusCode, message, errors } = err;

  // Default values
  statusCode = statusCode || 500;
  message = message || 'Internal Server Error';

  // Log error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
    
    // Trigger security alert for 500s (could indicate an exploit attempt or severe bug)
    AlertService.triggerAlert('INTERNAL_SERVER_ERROR', {
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      stack: err.stack?.substring(0, 500)
    }, 'CRITICAL');
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.details || err.errors;
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry. This record already exists.';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record not found.';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the maximum limit of 1MB';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // System/File errors (Prevent path leakage)
  // Catch errors like ENOENT, EACCES, EPERM, etc.
  if (err.syscall || (err.code && typeof err.code === 'string' && err.code.startsWith('E'))) {
    // Only log the full error, don't send details to client
    logger.error(`System Error: ${err.code} - ${err.message}`);
    
    AlertService.triggerAlert('SYSTEM_ERROR', {
      code: err.code,
      message: err.message,
      syscall: err.syscall,
      url: req.originalUrl
    }, 'CRITICAL');
    
    // Default to generic message for these types of errors
    statusCode = 500;
    message = 'An internal server error occurred'; 
  }

  // Response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { AppError, errorHandler };
