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

  // Ensure HTML has proper DOCTYPE and html tags to prevent spam filters from rejecting raw divs
  let formattedHtml = options.html || '';
  if (formattedHtml && !formattedHtml.includes('<!DOCTYPE html>')) {
    formattedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.subject || 'Somalia E-Visa Portal'}</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#ffffff;">
  ${formattedHtml}
</body>
</html>`;
  }

  // Generate plain text version (crucial for spam filters)
  let plainText = options.text;
  if (!plainText && options.html) {
    plainText = options.html
      .replace(/<style[^>]*>.*<\/style>/gi, '') // Remove styles completely
      .replace(/<br\s*[\/]?>/gi, '\n') // Replace breaks with newlines
      .replace(/<\/p>/gi, '\n\n') // Replace paragraph ends with double newlines
      .replace(/<\/h[1-6]>/gi, '\n\n') // Replace headers with newlines
      .replace(/<[^>]+>/g, '') // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s+\n/g, '\n\n')
      .trim();
  }

  const mailOptions = {
    from: process.env.EMAIL_USER ? `"Somalia E-Visa Portal" <${process.env.EMAIL_USER}>` : '"Somalia E-Visa Portal" <noreply@evisa.somalia>',
    to: options.email,
    replyTo: process.env.EMAIL_USER || 'noreply@evisa.somalia',
    subject: options.subject,
    text: plainText,
    html: formattedHtml,
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
