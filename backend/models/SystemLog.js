const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'VISA_APPROVED', 'LOGIN_FAILED'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SystemLog', systemLogSchema);
