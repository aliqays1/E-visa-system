const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  officerName: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'Login', 
      'Approved Visa', 
      'Rejected Visa', 
      'Status Update',
      'Verified Payment', 
      'Recorded Entry', 
      'Recorded Exit',
      'Ran Overstay Check'
    ]
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication' },
  details: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
