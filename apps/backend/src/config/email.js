const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const createTransporter = async () => {
  // If credentials are provided, use them
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', // Default to Gmail if only user/pass provided
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: JSON Transport (Logs emails to console instead of sending)
  // This ensures the app works "by default" without configuration.
  logger.warn('WARNING: No SMTP credentials found. Using JSON Transport (emails will be logged to console).');
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

const emailConfig = {
  from: process.env.EMAIL_FROM || 'boglogodwin10@gmail.com',
  templates: {
    registration: 'registration',
    applicationSubmitted: 'application-submitted',
    applicationApproved: 'application-approved',
    applicationRejected: 'application-rejected',
    documentRequired: 'document-required',
    passwordReset: 'password-reset',
    voucherGenerated: 'voucher-generated'
  }
};

module.exports = {
  getTransporter,
  emailConfig
};
