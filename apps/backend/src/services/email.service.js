const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use ethereal for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@ethereal.email',
        pass: process.env.EMAIL_PASS || 'testpass'
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Send voucher credentials email
 */
const sendVoucherCredentials = async (to, data) => {
  const { serialNumber, pinCode, expiresAt } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .credentials { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .credential-item { margin: 15px 0; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-size: 28px; font-weight: bold; color: #006B3F; font-family: monospace; letter-spacing: 2px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Recruitment Portal</p>
        </div>
        <div class="content">
          <h2>Your Registration Credentials</h2>
          <p>Your voucher has been validated. Use the following credentials to complete your registration:</p>
          
          <div class="credentials">
            <div class="credential-item">
              <div class="label">Serial Number</div>
              <div class="value">${serialNumber}</div>
            </div>
            <div class="credential-item">
              <div class="label">PIN Code</div>
              <div class="value">${pinCode}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>Keep these credentials safe and do not share them</li>
              <li>You will need both to complete registration</li>
              <li>These credentials expire on ${new Date(expiresAt).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/register" class="btn">Complete Registration</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: 'Your GPS Recruitment Registration Credentials',
      html
    });

    logger.info(`Voucher credentials email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send voucher credentials email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send registration confirmation
 */
const sendRegistrationConfirmation = async (to, data) => {
  const { serialNumber, email } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .success { background: #d4edda; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .success-icon { font-size: 48px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Recruitment Portal</p>
        </div>
        <div class="content">
          <div class="success">
            <div class="success-icon">✅</div>
            <h2>Registration Successful!</h2>
            <p>Your account has been created successfully.</p>
          </div>
          
          <p><strong>Serial Number:</strong> ${serialNumber}</p>
          <p><strong>Email:</strong> ${email}</p>
          
          <p>You can now login to your account and complete your application form.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/login" class="btn">Login to Your Account</a>
          </p>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Complete all sections of the application form</li>
            <li>Upload required documents</li>
            <li>Review and submit your application</li>
          </ol>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: 'Registration Confirmed - GPS Recruitment Portal',
      html
    });

    logger.info(`Registration confirmation sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send registration confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send application status update
 */
const sendApplicationStatusUpdate = async (to, data) => {
  const { applicationId, status, message } = data;
  
  const statusColors = {
    APPROVED: '#28a745',
    REJECTED: '#dc3545',
    DOCUMENTS_REQUIRED: '#ffc107',
    SUBMITTED: '#17a2b8'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 50px; font-weight: bold; color: white; background: ${statusColors[status] || '#6c757d'}; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Application Update</p>
        </div>
        <div class="content">
          <h2>Application Status Update</h2>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p style="text-align: center; margin: 30px 0;">
            <span class="status-badge">${status.replace('_', ' ')}</span>
          </p>
          ${message ? `<p>${message}</p>` : ''}
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Application</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: `Application Status: ${status.replace('_', ' ')} - ${applicationId}`,
      html
    });

    logger.info(`Status update email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send application submission confirmation
 */
const sendApplicationSubmissionConfirmation = async (to, data) => {
  const { applicationId, firstName, category } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .info-box { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Application Received</p>
        </div>
        <div class="content">
          <h2>Application Successfully Submitted!</h2>
          <p>Dear ${firstName},</p>
          <p>This is to confirm that we have received your recruitment application.</p>
          
          <div class="info-box">
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your application is now being processed. You can log in to the portal at any time to check the status of your application or download your summary report.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
          </p>
          
          <p>Best regards,<br>The Recruitment Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: `Application Submitted - ${applicationId}`,
      html
    });

    logger.info(`Submission confirmation sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send submission confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
const sendPasswordReset = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Password Reset</p>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: 'Password Reset Request - GPS Recruitment Portal',
      html
    });

    logger.info(`Password reset email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification link
 */
const sendEmailVerification = async (to, data) => {
  const { token, serialNumber } = data;
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #006B3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Ghana Police Service</h1>
          <p>Email Verification</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering with the Ghana Police Service Recruitment Portal.</p>
          <p>Your serial number is: <strong>${serialNumber}</strong></p>
          <p>Please click the button below to verify your email address and complete your registration:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          </p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link is for one-time use only</li>
              <li>If you did not register for this account, please ignore this email</li>
            </ul>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">${verifyUrl}</p>
        </div>
        <div class="footer">
          <p>© 2025 Ghana Police Service. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghana Police Recruitment" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to,
      subject: 'Verify Your Email - GPS Recruitment Portal',
      html
    });

    logger.info(`Email verification link sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email verification:', error);
    // Log the verification URL so it can still be used manually in case of email failure
    logger.info(`Verification URL for ${to}: ${verifyUrl}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVoucherCredentials,
  sendRegistrationConfirmation,
  sendApplicationStatusUpdate,
  sendApplicationSubmissionConfirmation,
  sendPasswordReset,
  sendEmailVerification
};
