const VisaApplication = require('../models/VisaApplication');
const ActivityLog = require('../models/ActivityLog');

exports.getOverviewStats = async (req, res) => {
  try {
    const totalApps = await VisaApplication.countDocuments();
    const approved = await VisaApplication.countDocuments({ applicationStatus: 'Approved' });
    const rejected = await VisaApplication.countDocuments({ applicationStatus: 'Rejected' });
    const pending = await VisaApplication.countDocuments({ applicationStatus: { $in: ['Submitted', 'Under Review'] } });
    
    // Total overstays
    const overstays = await VisaApplication.countDocuments({ entryStatus: 'Overstayed' });

    res.json({
      success: true,
      stats: { totalApps, approved, rejected, pending, overstays }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching auditor stats' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await VisaApplication.find()
      .populate('applicantId', 'fullName email')
      .populate('officerId', 'fullName')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('targetId', 'visaType applicationStatus entryStatus')
      .sort({ createdAt: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching activity logs' });
  }
};
