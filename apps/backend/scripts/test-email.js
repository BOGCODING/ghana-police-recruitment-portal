require('dotenv').config();
const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    console.log('Using Ethereal (Development Mode)');
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

  console.log('Using Production Config');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  // Do not log password

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

const sendTestEmail = async () => {
  const transporter = createTransporter();
  const testEmail = 'boneforgames@gmail.com'; // Using the email from user logs

  try {
    const info = await transporter.sendMail({
      from: `"Test Sender" <${process.env.EMAIL_FROM || 'noreply@gps.gov.gh'}>`,
      to: testEmail,
      subject: 'Test Email from Debug Script',
      text: 'If you see this, email sending is working.'
    });

    console.log('Message sent: %s', info.messageId);
    if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();
