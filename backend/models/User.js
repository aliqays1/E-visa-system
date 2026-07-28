const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['applicant', 'officer', 'auditor'], default: 'applicant' },
  phone: String,
  nationality: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
