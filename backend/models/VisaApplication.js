const mongoose = require('mongoose');

const visaApplicationSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visaType: { type: String, enum: ['Tourism', 'Tourist', 'Study', 'Student', 'Work', 'Worker', 'Medical', 'Business', 'Family', 'Diplomatic'], required: true, index: true },
  purposeOfTravel: { type: String, required: true },
  passportNumber: { type: String }, // Top-level for easy DB visibility
  passportDocument: { type: String }, // URL/path to stored file
  supportingDocuments: [{ type: String }],
  personalDetails: { type: Object },
  travelDetails: { type: Object },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentDetails: {
    transactionId: String,
    amountPaid: Number
  },
  applicationStatus: { type: String, enum: ['Submitted', 'Pending', 'Under Review', 'Needs Revision', 'Approved', 'Rejected', 'Expired'], default: 'Submitted', index: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The officer who processed it
  rejectionReason: { type: String },
  visaDuration: { type: Number }, // in days
  approvalDate: { type: Date },
  expirationDate: { type: Date },
  qrCodeUrl: { type: String },
  pdfUrl: { type: String },
  secureToken: { type: String, index: true }, // For QR code verification
  entryStatus: { type: String, enum: ['Not Entered', 'Entered', 'Exited', 'Overstayed'], default: 'Not Entered' },
  entryDate: { type: Date },
  exitDate: { type: Date },
  overstayAlert: { type: Boolean, default: false },
  lastWarningSentAt: { type: Date },
  scannedHistory: [{
    action: { type: String, enum: ['Entry', 'Exit', 'Overstay Warning', 'Scan', 'Verified'], required: true },
    timestamp: { type: Date, default: Date.now },
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String }
  }]
}, { timestamps: true });

// Add composite or nested indexes
visaApplicationSchema.index({ createdAt: -1 });
visaApplicationSchema.index({ 'personalDetails.email': 1 });

module.exports = mongoose.model('VisaApplication', visaApplicationSchema);
