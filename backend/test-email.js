require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testEmail() {
  console.log('Testing email with user:', process.env.EMAIL_USER);
  try {
    await sendEmail({
      email: process.env.EMAIL_USER,
      subject: 'Test Email',
      html: '<h1>Test</h1>'
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
