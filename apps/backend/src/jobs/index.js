const Queue = require('bull');
const logger = require('../utils/logger');

// Redis configuration for Bull queues - mirroring redis.js logic for TLS support
const getRedisConfig = () => {
  const url = process.env.REDIS_URL;
  
  if (url) {
    const isTls = url.startsWith('rediss://');
    
    // For Bull, if we provide an object as the 2nd argument, 
    // it looks for the 'redis' property for ioredis options.
    return {
      redis: {
        port: parseInt(new URL(url).port) || 6379,
        host: new URL(url).hostname,
        password: new URL(url).password || undefined,
        tls: isTls ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: null, // Required for Bull
        enableReadyCheck: false,
      },
      ...defaultJobOptions
    };
  }

  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null
    },
    ...defaultJobOptions
  };
};

const redisConfig = getRedisConfig();

// Default job options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000 // Start with 2 seconds, then 4s, 8s
  },
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50 // Keep last 50 failed jobs for debugging
};

// Email queue with configuration
const emailQueue = new Queue('email', redisConfig);

// Queue event handlers
emailQueue.on('error', (error) => {
  logger.error('Email queue error:', error);
});

emailQueue.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, {
    to: job.data.to,
    subject: job.data.subject,
    error: error.message,
    attemptsMade: job.attemptsMade
  });
});

emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed:`, {
    to: job.data.to,
    subject: job.data.subject
  });
});

emailQueue.on('stalled', (job) => {
  logger.warn(`Email job ${job.id} stalled, will be retried`);
});

// Helper function to add email to queue
const addEmailJob = async (emailData, options = {}) => {
  try {
    const job = await emailQueue.add(emailData, {
      ...defaultJobOptions,
      ...options
    });
    logger.info(`Email job ${job.id} added to queue:`, { to: emailData.to });
    return job;
  } catch (error) {
    logger.error('Failed to add email job:', error);
    throw error;
  }
};

// Graceful shutdown
const closeQueues = async () => {
  logger.info('Closing job queues...');
  await emailQueue.close();
  logger.info('Job queues closed');
};

module.exports = {
  emailQueue,
  addEmailJob,
  closeQueues,
  defaultJobOptions
};
