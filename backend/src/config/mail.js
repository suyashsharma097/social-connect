import nodemailer from 'nodemailer';
import env from './env.js';
import logger from './logger.js';

let transporter;

// Dynamically setup transporter
const initTransporter = async () => {
  if (env.env === 'test') {
    transporter = nodemailer.createTransport({
      jsonTransport: true // Returns the email as JSON in tests
    });
    return;
  }

  const hasSmtp = env.smtp.host && env.smtp.auth.user && env.smtp.auth.pass;

  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: {
        user: env.smtp.auth.user,
        pass: env.smtp.auth.pass,
      },
    });
    logger.info('SMTP transporter configured.');
  } else {
    // Generate test account for Ethereal
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Mock SMTP transporter configured. Test emails can be viewed at: https://ethereal.email (User: ${testAccount.user})`);
    } catch (err) {
      logger.warn(`Failed to create test SMTP account, falling back to JSON transport: ${err.message}`);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }
};

initTransporter();

export const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    await initTransporter();
  }

  const mailOptions = {
    from: env.smtp.from || 'noreply@social-connect.com',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId || 'Success'}`);
    if (info.envelope) {
      // For Ethereal, log the preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email preview URL: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};
