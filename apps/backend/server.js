require('dotenv').config(); // Restart trigger

const app = require('./src/app');
const { createServer } = require('http');
const { initializeWebSocket } = require('./src/websocket');
const { connectDatabase } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Start server
const startServer = async () => {
  try {
    // Start listening immediately so health checks pass on Render
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Initialize connections in parallel
    const [dbResult, redisResult] = await Promise.allSettled([
      connectDatabase(),
      connectRedis()
    ]);

    if (dbResult.status === 'fulfilled') {
      logger.info('PostgreSQL connected successfully');
    } else {
      logger.error('PostgreSQL connection failed during startup:', dbResult.reason.message);
    }

    if (redisResult.status === 'fulfilled') {
      logger.info('Redis connected successfully');
    } else {
      logger.error('Redis connection failed during startup:', redisResult.reason.message);
    }

    logger.info(`CORS Allowed Origins: ${process.env.CORS_ORIGIN || 'None (using defaults)'}`);
  } catch (error) {
    logger.error('Unexpected error during startup:', error);
    // Prefer to stay alive so we can log errors, but if it's a critical port error, we exit
    if (error.code === 'EADDRINUSE') process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('CRITICAL: Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

startServer();
