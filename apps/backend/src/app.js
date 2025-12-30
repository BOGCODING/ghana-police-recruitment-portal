const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const path = require('path');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { corsOptions } = require('./config/cors');
const logger = require('./utils/logger');
const loggerMiddleware = require('./middleware/logger.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { sanitize } = require('./middleware/sanitize.middleware');

const app = express();
app.set('trust proxy', 1); // Trust Render proxy for Secure cookies

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Enable pre-flight across-the-board
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Apply Global Middleware
app.use(loggerMiddleware);
app.use(apiLimiter);
app.use(sanitize);
app.use(compression());
app.use(express.json({ limit: '1mb' })); // Reduced limit for general API
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Restrict batching (No Array bodies)
app.use((req, res, next) => {
  if (Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Batching is not allowed (JSON Array bodies are disabled)'
    });
  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Auto uppercase middleware for form data
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const uppercaseFields = [
      'firstName', 'lastName', 'middleName', 'surname',
      'fatherName', 'motherName', 'guardianName',
      'hometown', 'district', 'region', 'address',
      'schoolName', 'institutionName', 'employer'
    ];
    
    uppercaseFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].toUpperCase();
      }
    });
  }
  next();
});

// Static files for uploads (protected)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use(['/api', '/api/api'], routes);

// Health check endpoint with DB and Redis checks
app.get('/health', async (req, res) => {
  const { query } = require('./config/database');
  const { getRedis } = require('./config/redis');
  
  const healthStatus = {
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    // Check DB
    await query('SELECT 1');
    healthStatus.services.database = 'connected';
  } catch (err) {
    healthStatus.success = false;
    healthStatus.services.database = 'disconnected';
    logger.error('Health Check - DB disconnected:', err);
  }

  try {
    // Check Redis
    const redis = getRedis();
    if (redis && (redis.status === 'ready' || redis.status === 'connecting')) {
      healthStatus.services.redis = 'connected';
    } else {
      healthStatus.services.redis = 'disconnected';
      if (!healthStatus.success) healthStatus.success = false;
    }
  } catch (err) {
    healthStatus.services.redis = 'error';
    logger.error('Health Check - Redis error:', err);
  }

  const statusCode = healthStatus.success ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ghana Police Recruitment API is running',
    docs: '/api/docs',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling - MUST be last middleware
app.use(errorHandler);

// --- Runtime Process Protection ---
const AlertService = require('./services/alert.service');

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  // Try to alert before crashing
  AlertService.triggerAlert('RUNTIME_CRASH_UNCAUGHT_EXCEPTION', {
    name: err.name,
    message: err.message,
    stack: err.stack?.substring(0, 500)
  }, 'CRITICAL').finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  AlertService.triggerAlert('RUNTIME_CRASH_UNHANDLED_REJECTION', {
    name: err?.name || 'Error',
    message: err?.message || String(err),
    stack: err?.stack?.substring(0, 500)
  }, 'CRITICAL').finally(() => {
    process.exit(1);
  });
});

module.exports = app;
