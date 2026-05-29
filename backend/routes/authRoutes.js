const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  verifyRegisterOtp, 
  verifyLoginOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-register', verifyRegisterOtp);
router.post('/login', loginUser);
router.post('/verify-login', verifyLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
