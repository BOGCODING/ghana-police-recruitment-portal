const Queue = require('bull');
const logger = require('../utils/logger');

// Redis configuration for Bull queues
const redisConfig = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3
    }
  };

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
