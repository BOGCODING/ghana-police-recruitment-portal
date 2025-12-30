const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { sanitizeEnv } = require('../utils/helpers');

let transporter = null;

const createTransporter = async () => {
  const host = sanitizeEnv(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const port = parseInt(sanitizeEnv(process.env.SMTP_PORT)) || 587;
  const user = sanitizeEnv(process.env.SMTP_USER);
  const pass = sanitizeEnv(process.env.SMTP_PASS);
  const secure = sanitizeEnv(process.env.SMTP_SECURE) === 'true';

  // If credentials are provided, use them
  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
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
