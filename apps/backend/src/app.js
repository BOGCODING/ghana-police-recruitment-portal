const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { corsOptions } = require('./config/cors');
const logger = require('./utils/logger');
const loggerMiddleware = require('./middleware/logger.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { sanitize } = require('./middleware/sanitize.middleware');

const app = express();

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ghana Police Service Recruitment Portal API',
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

// Error handler
app.use(errorHandler);

module.exports = app;
