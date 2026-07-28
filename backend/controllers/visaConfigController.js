const VisaConfig = require('../models/VisaConfig');
const ActivityLog = require('../models/ActivityLog');

// Get all visa configurations
exports.getConfigs = async (req, res) => {
  try {
    const configs = await VisaConfig.find().sort({ visaType: 1 }).lean();
    res.json({ success: true, configs });
  } catch (error) {
    console.error('Error fetching visa configs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching configs' });
  }
};

// Create or Update a visa configuration
exports.upsertConfig = async (req, res) => {
  try {
    const visaType = req.params.visaType || req.body.visaType;
    const { options } = req.body;
    
    if (!visaType || !Array.isArray(options)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    let config = await VisaConfig.findOne({ visaType });
    if (config) {
      config.options = options;
      await config.save();
    } else {
      config = await VisaConfig.create({ visaType, options });
    }

    if (req.user && (req.user.role === 'admin' || req.user.role === 'officer')) {
       try {
         await ActivityLog.create({
            officerId: req.user._id,
            officerName: req.user.fullName,
            action: 'Updated Visa Config',
            targetId: config._id,
            details: `Updated pricing config for ${visaType}`,
            ipAddress: req.ip
         });
       } catch (logErr) {
         console.warn('Activity log failed (non-critical):', logErr.message);
       }
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error upserting visa config:', error);
    res.status(500).json({ success: false, message: 'Server error upserting config' });
  }
};

// Delete a visa configuration
exports.deleteConfig = async (req, res) => {
  try {
    const { visaType } = req.params;
    if (!visaType) {
      return res.status(400).json({ success: false, message: 'Visa type is required' });
    }

    await VisaConfig.deleteOne({ visaType: { $regex: new RegExp(`^${visaType}$`, 'i') } });

    if (req.user && (req.user.role === 'admin' || req.user.role === 'officer')) {
       try {
         await ActivityLog.create({
            officerId: req.user._id,
            officerName: req.user.fullName,
            action: 'Deleted Visa Config',
            targetId: req.user._id,
            details: `Deleted visa configuration for ${visaType}`,
            ipAddress: req.ip
         });
       } catch (logErr) {
         console.warn('Activity log failed (non-critical):', logErr.message);
       }
    }

    res.json({ success: true, message: `Visa configuration for ${visaType} deleted successfully` });
  } catch (error) {
    console.error('Error deleting visa config:', error);
    res.status(500).json({ success: false, message: 'Server error deleting config' });
  }
};

// Rename a visa configuration type
exports.renameConfig = async (req, res) => {
  try {
    const { oldVisaType } = req.params;
    const { newVisaType } = req.body;

    if (!oldVisaType || !newVisaType || !newVisaType.trim()) {
      return res.status(400).json({ success: false, message: 'Both old and new visa type names are required' });
    }

    const trimmedNew = newVisaType.trim();

    // Check if new type already exists
    const existing = await VisaConfig.findOne({ 
      visaType: { $regex: new RegExp(`^${trimmedNew}$`, 'i') } 
    });
    if (existing && existing.visaType.toLowerCase() !== oldVisaType.toLowerCase()) {
      return res.status(400).json({ success: false, message: `Visa type "${trimmedNew}" already exists` });
    }

    let config = await VisaConfig.findOne({ 
      visaType: { $regex: new RegExp(`^${oldVisaType}$`, 'i') } 
    });

    if (config) {
      config.visaType = trimmedNew;
      await config.save();
    } else {
      config = await VisaConfig.create({ visaType: trimmedNew, options: [] });
    }

    if (req.user && (req.user.role === 'admin' || req.user.role === 'officer')) {
       try {
         await ActivityLog.create({
            officerId: req.user._id,
            officerName: req.user.fullName,
            action: 'Renamed Visa Config',
            targetId: config._id,
            details: `Renamed visa configuration from ${oldVisaType} to ${trimmedNew}`,
            ipAddress: req.ip
         });
       } catch (logErr) {
         console.warn('Activity log failed (non-critical):', logErr.message);
       }
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error renaming visa config:', error);
    res.status(500).json({ success: false, message: 'Server error renaming config' });
  }
};
