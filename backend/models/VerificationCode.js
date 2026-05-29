const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['login', 'register', 'track', 'reset'], required: true },
  userData: { type: Object }, // Used temporarily for storing register payload
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Auto-delete expired codes
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
