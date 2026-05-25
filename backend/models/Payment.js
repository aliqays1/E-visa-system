const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visaApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String },
  transactionReference: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
