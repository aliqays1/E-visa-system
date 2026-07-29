const mongoose = require('mongoose');

const visaApplicationSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visaType: { type: String, required: true, index: true },
  purposeOfTravel: { type: String, required: true },
  passportNumber: { type: String }, // Top-level for easy DB visibility
  passportDocument: { type: String }, // URL/path to stored file
  supportingDocuments: [{ type: String }],
  admissionDocument: { type: String }, // Proof of university/school admission acceptance for Student visas
  personalDetails: { type: Object },
  travelDetails: { type: Object },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentDetails: {
    transactionId: String,
    amountPaid: Number
  },
  applicationStatus: { type: String, enum: ['Submitted', 'Pending', 'Under Review', 'Needs Revision', 'Approved', 'Active', 'Renewal Pending', 'Rejected', 'Expired', 'Overstayed'], default: 'Submitted', index: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The officer who processed it
  rejectionReason: { type: String },
  visaDuration: { type: Number }, // in days
  stayDuration: { type: Number }, // Number of permitted days in Somalia after entry (e.g. 30, 60, 90)
  issueDate: { type: Date }, // Approval / Issue date
  entryValidUntil: { type: Date }, // Last date allowed to enter Somalia (Entry Validity Window)
  approvalDate: { type: Date },
  expirationDate: { type: Date }, // Legacy field, keeping for compatibility
  validUntilDate: { type: Date }, // Legacy alias for entryValidUntil
  stayExpiryDate: { type: Date }, // Date applicant must leave (calculated as entryDate + stayDuration)
  applicationType: { type: String, enum: ['New', 'Renewal'], default: 'New' },
  linkedApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication' },
  qrCodeUrl: { type: String },
  pdfUrl: { type: String },
  secureToken: { type: String, index: true }, // Permanent static QR code token
  entryRecorded: { type: Boolean, default: false }, // True once first border entry is saved
  entryStatus: { type: String, enum: ['Not Entered', 'Entered', 'Exited', 'Overstayed'], default: 'Not Entered' },
  entryDate: { type: Date },
  entryOfficer: { type: String },
  entryPort: { type: String },
  exitDate: { type: Date },
  renewalCount: { type: Number, default: 0 },
  renewalHistory: [{
    renewedAt: { type: Date, default: Date.now },
    addedDays: { type: Number },
    oldExpiryDate: { type: Date },
    newExpiryDate: { type: Date },
    approvedBy: { type: String }
  }],
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
