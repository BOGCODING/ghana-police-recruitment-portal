const { emailQueue } = require('./index');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Process email jobs with concurrency of 5
emailQueue.process(5, async (job) => {
  const { to, subject, template, context } = job.data;
  
  logger.info(`Processing email job ${job.id}:`, { to, subject });
  
  try {
    const result = await emailService.sendEmail(to, subject, template, context);
    
    logger.info(`Email sent successfully for job ${job.id}:`, { to });
    
    return {
      success: true,
      messageId: result?.messageId,
      to,
      subject
    };
  } catch (error) {
    logger.error(`Email send failed for job ${job.id}:`, {
      to,
      subject,
      error: error.message
    });
    
    // Throw to trigger retry mechanism
    throw error;
  }
});

// Job-specific event handlers
emailQueue.on('active', (job) => {
  logger.debug(`Email job ${job.id} started processing`);
});

emailQueue.on('progress', (job, progress) => {
  logger.debug(`Email job ${job.id} progress: ${progress}%`);
});

module.exports = emailQueue;
