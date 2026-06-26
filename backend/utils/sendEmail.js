const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Try to use provided credentials, otherwise use a placeholder/logger
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // false for port 587
    auth: {
      user: process.env.EMAIL_USER || 'placeholder@example.com',
      pass: process.env.EMAIL_PASS || 'placeholder_pass',
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER ? `"Somalia E-Visa Portal" <${process.env.EMAIL_USER}>` : '"Somalia E-Visa Portal" <noreply@evisa.somalia>',
    to: options.email,
    replyTo: process.env.EMAIL_USER || 'noreply@evisa.somalia',
    subject: options.subject,
    text: options.html ? options.html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() : '',
    html: options.html,
  };

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n--- EMAIL LOG (No SMTP Credentials Configured) ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (HTML): \n${options.html}`);
    console.log('--------------------------------------------------\n');
    return; // Do not attempt to send if credentials are not configured
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email successfully sent to:', options.email);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('CRITICAL ERROR: Failed to send email to', options.email);
    console.error(error);
    throw error;
  }
};

module.exports = sendEmail;
