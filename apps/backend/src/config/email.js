const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const createTransporter = async () => {
  // For development, use ethereal.email for testing
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    logger.info('Created ethereal test email account:', testAccount.user);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@gps-recruitment.gov.gh',
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
