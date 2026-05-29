const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, nationality } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Instead of creating the user immediately, we send an OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60000); // 2 minutes

    // Remove any existing registration codes for this email
    await VerificationCode.deleteMany({ email, type: 'register' });

    await VerificationCode.create({
      email,
      code,
      type: 'register',
      userData: { fullName, password, role, phone, nationality },
      expiresAt
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e3a8a; text-align: center;">Verify Your Email</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello ${fullName},</p>
        <p style="color: #4b5563; font-size: 16px;">Thank you for registering with the Somalia E-Visa Portal. Please use the verification code below to complete your registration.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e3a8a;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 2 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Somalia E-Visa - Registration Verification Code',
      html: emailHtml
    });

    res.status(200).json({ requires_otp: true, email, message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    const verification = await VerificationCode.findOne({ email, code, type: 'register' });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const { fullName, password, role, phone, nationality } = verification.userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'applicant',
      phone,
      nationality
    });

    // Delete code after successful use
    await VerificationCode.deleteOne({ _id: verification._id });

    if (user) {
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nationality: user.nationality,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Verify Register OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Bypass OTP for specific accounts
      if (email === 'admin@evisa.gov.so' || email === 'auditor@evisa.gov.so') {
        return res.status(200).json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          nationality: user.nationality,
          token: generateToken(user._id, user.role),
        });
      }

      // Credentials are valid, send OTP
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 2 * 60000); // 2 minutes

      await VerificationCode.deleteMany({ email, type: 'login' });

      await VerificationCode.create({
        email,
        code,
        type: 'login',
        expiresAt
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1e3a8a; text-align: center;">Login Verification</h2>
          <p style="color: #4b5563; font-size: 16px;">Hello ${user.fullName},</p>
          <p style="color: #4b5563; font-size: 16px;">A login attempt was made to your Somalia E-Visa account. Please use the verification code below to proceed.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e3a8a;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 2 minutes.</p>
        </div>
      `;

      await sendEmail({
        email,
        subject: 'Somalia E-Visa - Login Verification Code',
        html: emailHtml
      });

      res.status(200).json({ requires_otp: true, email, message: 'Verification code sent to your email.' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    const verification = await VerificationCode.findOne({ email, code, type: 'login' });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If officer logs in, record it
    if (user.role === 'officer') {
      await ActivityLog.create({
        officerId: user._id,
        officerName: user.fullName,
        action: 'Login',
        details: 'Officer logged in to the portal via OTP',
        ipAddress: req.ip
      });
    }

    // Delete code after successful use
    await VerificationCode.deleteOne({ _id: verification._id });

    res.json({
      _id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Verify Login OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user doesn't exist for security (prevents email enumeration)
      // but in this app we might want to tell them so they don't get confused.
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60000); // 2 minutes

    await VerificationCode.deleteMany({ email, type: 'reset' });

    await VerificationCode.create({
      email,
      code,
      type: 'reset',
      expiresAt
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello ${user.fullName},</p>
        <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password. Please use the verification code below to verify your identity.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e3a8a;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 2 minutes.</p>
        <p style="color: #dc2626; font-size: 14px; font-weight: bold;">If you did not request a password reset, please ignore this email. Your password will not change.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Somalia E-Visa - Password Reset Code',
      html: emailHtml
    });

    res.status(200).json({ success: true, message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    const verification = await VerificationCode.findOne({ email, code, type: 'reset' });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Delete code after successful use
    await VerificationCode.deleteOne({ _id: verification._id });

    // Generate a short-lived temporary token for resetting password
    const resetToken = jwt.sign({ email, purpose: 'reset-password' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({ success: true, resetToken });
  } catch (error) {
    console.error('Verify Reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Verify the short-lived token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.email !== email || decoded.purpose !== 'reset-password') {
        throw new Error('Invalid token payload');
      }
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired reset session. Please try again.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();



    res.json({ success: true, message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
