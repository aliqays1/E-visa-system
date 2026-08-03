const VisaApplication = require('../models/VisaApplication');
const VerificationCode = require('../models/VerificationCode');
const VisaConfig = require('../models/VisaConfig');
const sendEmail = require('../utils/sendEmail');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { generateVisaPdf } = require('../utils/pdfGenerator');
const emailTemplates = require('../utils/emailTemplates');
const ActivityLog = require('../models/ActivityLog');
const os = require('os');
const path = require('path');
const imagekit = require('../utils/imagekit');

const uploadToImageKit = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    
    imagekit.upload({
      file: file.buffer,
      fileName: fileName,
      folder: '/evisa_uploads'
    }, (error, result) => {
      if (error) {
        console.error('ImageKit upload error:', error);
        reject(error);
      } else {
        resolve(result.url);
      }
    });
  });
};

// Helper to get the local network IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Apply for a Visa
exports.applyVisa = async (req, res) => {
  try {
    const {
      visaType,
      purposeOfTravel,
      personalDetails,
      travelDetails,
      paymentMethod,
      amountPaid,
      paymentStatus,
      visaDuration
    } = req.body;

    // Retrieve file paths from multer uploads and upload to ImageKit
    const passportFile = req.files && req.files.passportDocument ? req.files.passportDocument[0] : null;
    const photoFile = req.files && req.files.photoDocument ? req.files.photoDocument[0] : null;
    const supportingFile = req.files && req.files.supportingDocument ? req.files.supportingDocument[0] : null;
    const admissionFile = req.files && req.files.admissionDocument ? req.files.admissionDocument[0] : null;

    const [passportDocument, photoDocument, supportingDocument, admissionDocument] = await Promise.all([
      uploadToImageKit(passportFile),
      uploadToImageKit(photoFile),
      uploadToImageKit(supportingFile),
      uploadToImageKit(admissionFile)
    ]);

    // Parse JSON details if sent as strings (via FormData)
    const parsedPersonalDetails = typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails;
    const parsedTravelDetails = typeof travelDetails === 'string' ? JSON.parse(travelDetails) : travelDetails;

    // --- DOCUMENT VERIFICATION WORKFLOW ---
    const passportNumber = parsedPersonalDetails?.passportNumber;
    
    if (passportNumber) {
      // 2. Duplicate passport detection removed as per user request
    }
    // ---------------------------------------

    const vType = visaType || 'Tourism';
    // Always resolve duration from admin VisaConfig — never use hardcoded fallback
    const requestedDuration = visaDuration ? Number(visaDuration) : null;
    let vDuration = requestedDuration;
    {
      const appConfig = await VisaConfig.findOne({ visaType: vType });
      if (appConfig && appConfig.options && appConfig.options.length > 0) {
        // Find exact match or take the first configured option as default
        const matchedOption = requestedDuration
          ? appConfig.options.find(o => o.duration === requestedDuration)
          : null;
        vDuration = matchedOption ? matchedOption.duration : (requestedDuration || appConfig.options[0].duration);
      } else if (!vDuration) {
        vDuration = 30; // Last-resort fallback when admin has not configured anything yet
      }
    }
    
    // Validate amount against config
    let expectedAmount = 50; // Fallback
    const config = await VisaConfig.findOne({ visaType: vType });
    if (config) {
      const option = config.options.find(o => o.duration === vDuration);
      if (option) expectedAmount = option.price;
    }
    const finalAmount = amountPaid ? Number(amountPaid) : 0;
    if (finalAmount < expectedAmount) {
       return res.status(400).json({
          success: false,
          message: `Payment amount must be ${expectedAmount}`
       });
    }

    const newApplication = new VisaApplication({
      applicantId: req.user._id,
      visaType: vType,
      purposeOfTravel: purposeOfTravel || 'Not Specified',
      passportNumber: passportNumber || '',
      passportDocument,
      supportingDocuments: [photoDocument, supportingDocument].filter(Boolean),
      admissionDocument,
      personalDetails: parsedPersonalDetails || {},
      travelDetails: parsedTravelDetails || {},
      paymentStatus: paymentStatus || 'Completed', 
      paymentDetails: {
        amountPaid: finalAmount,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      visaDuration: vDuration,
      applicationType: 'New',
      applicationStatus: 'Submitted'
    });

    const savedApplication = await newApplication.save();

    // Send Application Received Email asynchronously
    if (parsedPersonalDetails && parsedPersonalDetails.email) {
      const applicantName = `${parsedPersonalDetails.firstName || ''} ${parsedPersonalDetails.lastName || ''}`.trim();
      sendEmail({
        email: parsedPersonalDetails.email,
        subject: 'Somalia E-Visa Application Received',
        html: emailTemplates.getApplicationReceivedTemplate(applicantName, savedApplication._id.toString())
      }).catch((emailError) => {
        console.error('Non-fatal error: Failed to send application received email.', emailError);
      });
    }

    // Create Payment record if applicable
    if (amountPaid && amountPaid > 0) {
      const Payment = require('../models/Payment');
      const newPayment = new Payment({
        applicantId: req.user._id,
        visaApplicationId: savedApplication._id,
        amount: Number(amountPaid),
        paymentMethod: paymentMethod || 'Credit Card',
        paymentStatus: paymentStatus || 'Completed',
        paymentDate: new Date(),
        transactionReference: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
      await newPayment.save();
    }

    res.status(201).json({ success: true, application: savedApplication });
  } catch (error) {
    console.error('Error applying for visa:', error);
    res.status(500).json({ success: false, message: 'Server error applying for visa' });
  }
};

// Renewal Endpoint
exports.renewVisa = async (req, res) => {
  try {
    const {
      linkedApplicationId,
      visaType,
      visaDuration,
      amountPaid,
      paymentMethod,
      paymentStatus,
      purposeOfTravel,
      personalDetails,
      travelDetails
    } = req.body || {};

    if (!linkedApplicationId) {
      return res.status(400).json({ success: false, message: 'Parent visa ID (linkedApplicationId) is required for renewal.' });
    }

    const originalApp = await VisaApplication.findById(linkedApplicationId);
    if (!originalApp || originalApp.applicantId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Original application not found or unauthorized.' });
    }

    // Renewal inherits all documents from the original application (no new uploads on renewal)
    const passportDocument = null;
    const photoDocument = null;
    const supportingDocument = null;
    const admissionDocument = null;

    const parsedPersonal = personalDetails ? (typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails) : originalApp.personalDetails;
    const parsedTravel = travelDetails ? (typeof travelDetails === 'string' ? JSON.parse(travelDetails) : travelDetails) : originalApp.travelDetails;

    // Always resolve duration from admin VisaConfig — never use hardcoded fallback
    const requestedRenewalDuration = visaDuration ? Number(visaDuration) : null;
    let vDuration = requestedRenewalDuration;
    {
      const renewConfig = await VisaConfig.findOne({ visaType: visaType || originalApp.visaType });
      if (renewConfig && renewConfig.options && renewConfig.options.length > 0) {
        const matchedOption = requestedRenewalDuration
          ? renewConfig.options.find(o => o.duration === requestedRenewalDuration)
          : null;
        vDuration = matchedOption ? matchedOption.duration : (requestedRenewalDuration || renewConfig.options[0].duration);
      } else if (!vDuration) {
        vDuration = 30; // Last-resort fallback when admin has not configured anything yet
      }
    }
    
    // Config validation
    let expectedAmount = 50;
    const config = await VisaConfig.findOne({ visaType: visaType || originalApp.visaType });
    if (config) {
      const option = config.options.find(o => o.duration === vDuration);
      if (option) expectedAmount = option.price;
    }
    const finalAmount = amountPaid ? Number(amountPaid) : 0;

    const renewalApp = new VisaApplication({
      applicantId: req.user._id,
      visaType: visaType || originalApp.visaType,
      purposeOfTravel: purposeOfTravel || originalApp.purposeOfTravel || 'Renewal',
      passportNumber: parsedPersonal?.passportNumber || originalApp.passportNumber,
      passportDocument: passportDocument || originalApp.passportDocument,
      supportingDocuments: [
        photoDocument || (originalApp.supportingDocuments && originalApp.supportingDocuments[0]),
        supportingDocument || (originalApp.supportingDocuments && originalApp.supportingDocuments[1])
      ].filter(Boolean),
      admissionDocument: admissionDocument || originalApp.admissionDocument,
      personalDetails: parsedPersonal,
      travelDetails: parsedTravel,
      paymentStatus: paymentStatus || 'Completed', 
      paymentDetails: {
        amountPaid: finalAmount,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      visaDuration: vDuration,
      applicationType: 'Renewal',
      linkedApplicationId: originalApp._id,
      applicationStatus: 'Submitted'
    });

    const savedApplication = await renewalApp.save();

    // Create Payment record
    if (finalAmount > 0) {
      const Payment = require('../models/Payment');
      const newPayment = new Payment({
        applicantId: req.user._id,
        visaApplicationId: savedApplication._id,
        amount: finalAmount,
        paymentMethod: paymentMethod || 'Credit Card',
        paymentStatus: paymentStatus || 'Completed',
        paymentDate: new Date(),
        transactionReference: savedApplication.paymentDetails.transactionId
      });
      await newPayment.save();
    }

    res.status(201).json({ success: true, application: savedApplication });
  } catch (error) {
    console.error('Error renewing visa:', error);
    res.status(500).json({ success: false, message: 'Server error creating renewal: ' + error.message });
  }
};

// Update an existing application (Needs Revision)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplication.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Security check: Only the applicant can update their own application
    if (application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    // Only allow updates if Needs Revision
    if (application.applicationStatus !== 'Needs Revision') {
      return res.status(400).json({ success: false, message: 'Application is not in Needs Revision status' });
    }

    const {
      visaType,
      purposeOfTravel,
      personalDetails,
      travelDetails,
      visaDuration
    } = req.body;

    // Retrieve file paths from multer uploads if any new files are provided and upload to ImageKit
    const passportFile = req.files && req.files.passportDocument ? req.files.passportDocument[0] : null;
    const photoFile = req.files && req.files.photoDocument ? req.files.photoDocument[0] : null;
    const supportingFile = req.files && req.files.supportingDocument ? req.files.supportingDocument[0] : null;
    const admissionFile = req.files && req.files.admissionDocument ? req.files.admissionDocument[0] : null;

    let newPassport = passportFile ? await uploadToImageKit(passportFile) : null;
    let newPhoto = photoFile ? await uploadToImageKit(photoFile) : null;
    let newSupporting = supportingFile ? await uploadToImageKit(supportingFile) : null;
    let newAdmission = admissionFile ? await uploadToImageKit(admissionFile) : null;

    const passportDocument = newPassport || application.passportDocument;
    const photoDocument = newPhoto || application.supportingDocuments[0];
    const supportingDocument = newSupporting || application.supportingDocuments[1];
    const admissionDocument = newAdmission || application.admissionDocument;

    // Parse JSON details if sent as strings (via FormData)
    const parsedPersonalDetails = typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails;
    const parsedTravelDetails = typeof travelDetails === 'string' ? JSON.parse(travelDetails) : travelDetails;

    // Update fields
    application.visaType = visaType || application.visaType;
    application.purposeOfTravel = purposeOfTravel || application.purposeOfTravel;
    if (parsedPersonalDetails) {
      application.personalDetails = parsedPersonalDetails;
      if (parsedPersonalDetails.passportNumber) {
        application.passportNumber = parsedPersonalDetails.passportNumber;
      }
    }
    if (parsedTravelDetails) {
      application.travelDetails = parsedTravelDetails;
    }
    if (visaDuration) {
      application.visaDuration = Number(visaDuration);
    }

    // Update documents
    application.passportDocument = passportDocument;
    application.supportingDocuments = [photoDocument, supportingDocument].filter(Boolean);
    if (admissionDocument) {
      application.admissionDocument = admissionDocument;
    }

    // Reset status to Under Review
    application.applicationStatus = 'Under Review';
    application.rejectionReason = ''; // Clear the revision note

    const savedApplication = await application.save();

    res.status(200).json({ success: true, application: savedApplication });
  } catch (error) {
    console.error('Error updating visa application:', error);
    res.status(500).json({ success: false, message: 'Server error updating visa application: ' + error.message });
  }
};

// Get current applicant's visa applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await VisaApplication.find({ applicantId: req.user._id })
      .select('-scannedHistory')
      .sort({ createdAt: -1 })
    const formattedApps = applications.map(app => {
      const appObj = app.toObject ? app.toObject() : app;
      if (appObj.entryDate || appObj.renewalCount > 0 || (appObj.renewalHistory && appObj.renewalHistory.length > 0) || ['Entered', 'Overstayed', 'Exited'].includes(appObj.entryStatus)) {
        appObj.entryRecorded = true;
      }
      if (!appObj.entryRecorded && ['Approved', 'Active'].includes(appObj.applicationStatus)) {
        const durationDays = Number(appObj.visaDuration) || Number(appObj.stayDuration) || 30;
        const baseTime = new Date(appObj.approvalDate || appObj.issueDate || appObj.createdAt).getTime();
        appObj.entryValidUntil = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
        appObj.validUntilDate = appObj.entryValidUntil;
      }
      return appObj;
    });
    res.json({ success: true, applications: formattedApps });
  } catch (error) {
    console.error('Error fetching applicant visas:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

// Get stats (Officer view)
exports.getStats = async (req, res) => {
  try {
    const [totalApps, pendingApps, approvedApps, rejectedApps, overstays] = await Promise.all([
      VisaApplication.countDocuments(),
      VisaApplication.countDocuments({ applicationStatus: { $in: ['Submitted', 'Pending', 'Under Review', 'Needs Revision'] } }),
      VisaApplication.countDocuments({ applicationStatus: { $in: ['Approved', 'Active'] } }),
      VisaApplication.countDocuments({ applicationStatus: 'Rejected' }),
      VisaApplication.countDocuments({ overstayAlert: true })
    ]);
    res.json({ success: true, stats: { totalApps, pendingApps, approvedApps, rejectedApps, overstays } });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// Get all applications (Officer view)
exports.getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const paymentStatus = req.query.paymentStatus;
    const entryStatus = req.query.entryStatus;
    const overstayAlert = req.query.overstayAlert;
    
    let query = {};
    if (search) {
      const terms = search.trim().split(/\s+/);
      query.$and = terms.map(term => {
        const searchRegex = new RegExp(term, 'i');
        const termQuery = {
          $or: [
            { 'personalDetails.firstName': searchRegex },
            { 'personalDetails.lastName': searchRegex },
            { 'personalDetails.passportNumber': searchRegex },
            { 'personalDetails.email': searchRegex },
            { secureToken: searchRegex }
          ]
        };
        if (term.match(/^[0-9a-fA-F]{24}$/)) {
          termQuery.$or.push({ _id: term });
        }
        return termQuery;
      });
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (entryStatus) {
      query.entryStatus = { $in: entryStatus.split(',') };
    }
    if (overstayAlert === 'true') {
      query.overstayAlert = true;
    }

    const skip = (page - 1) * limit;

    const applications = await VisaApplication.find(query)
      .select('-scannedHistory')
      .populate('applicantId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    const formattedApps = applications.map(app => {
      const appObj = app.toObject ? app.toObject() : app;
      if (appObj.entryRecorded || appObj.entryDate || ['Entered', 'Overstayed', 'Exited'].includes(appObj.entryStatus)) {
        if (['Approved', 'Active'].includes(appObj.applicationStatus)) {
          appObj.applicationStatus = 'Active';
        }
      } else if (['Approved', 'Active'].includes(appObj.applicationStatus)) {
        const durationDays = Number(appObj.visaDuration) || Number(appObj.stayDuration) || 30;
        const baseTime = new Date(appObj.approvalDate || appObj.issueDate || appObj.createdAt).getTime();
        const calculatedExpiry = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
        appObj.entryValidUntil = calculatedExpiry;
        appObj.validUntilDate = calculatedExpiry;
      }
      return appObj;
    });

    res.json({ 
      success: true, 
      applications: formattedApps,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all visas:', error);
    res.status(500).json({ success: false, message: 'Server error fetching all applications' });
  }
};

// Update application status (Approve/Reject)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, visaDuration } = req.body;

    const application = await VisaApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.applicationStatus = status;
    application.officerId = req.user._id;

    if (status === 'Approved') {
      // --- Resolve duration from admin VisaConfig first, fallback to stored value ---
      let duration = visaDuration ? parseInt(visaDuration) : (application.visaDuration || 30);
      {
        const statusConfig = await VisaConfig.findOne({ visaType: application.visaType });
        if (statusConfig && statusConfig.options && statusConfig.options.length > 0) {
          const matchedOpt = statusConfig.options.find(o => o.duration === duration);
          if (matchedOpt) {
            duration = matchedOpt.duration; // confirmed from config
          } else {
            // duration sent doesn't match any config option — use the stored value as-is but log a warning
            console.warn(`[updateStatus] Duration ${duration} not found in VisaConfig for ${application.visaType}. Using stored value.`);
          }
        }
      }
      application.visaDuration = duration;
      application.stayDuration = duration;

      // --- Handle Renewal approval: extend parent visa in-place, NO new border entry record ---
      if (application.linkedApplicationId || application.applicationType === 'Renewal') {
        // Mark the renewal sub-application as processed (Active) but do NOT create a border entry.
        // The applicant is already inside the country; their original entry record stands.
        application.applicationStatus = 'Active';
        // NOTE: Do NOT set entryRecorded=true or entryStatus='Entered' on the renewal sub-app.
        //       Border entry was already recorded on the original/parent application.

        const parentApp = await VisaApplication.findById(application.linkedApplicationId);
        if (parentApp) {
          // Calculate remaining days on the parent visa from now
          const now = new Date();
          const currentExpiry = parentApp.stayExpiryDate || parentApp.expirationDate;
          const remainingMs = currentExpiry ? (new Date(currentExpiry) - now) : 0;
          const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

          // New expiry = current expiry + renewal duration (preserves unused remaining days)
          const oldExpiry = currentExpiry ? new Date(currentExpiry) : now;
          const newExpiry = new Date(oldExpiry.getTime() + duration * 24 * 60 * 60 * 1000);
          const totalRemainingDays = remainingDays + duration;

          parentApp.stayExpiryDate = newExpiry;
          parentApp.expirationDate = newExpiry;
          // stayDuration reflects total remaining permitted days after this renewal
          parentApp.stayDuration = totalRemainingDays;
          parentApp.visaDuration = duration; // records what this renewal added
          if (application.visaType) {
            parentApp.visaType = application.visaType;
          }
          parentApp.applicationStatus = 'Active';
          parentApp.renewalCount = (parentApp.renewalCount || 0) + 1;
          if (!parentApp.renewalHistory) parentApp.renewalHistory = [];
          parentApp.renewalHistory.push({
            renewedAt: now,
            addedDays: duration,
            oldExpiryDate: oldExpiry,
            newExpiryDate: newExpiry,
            approvedBy: req.user.fullName || 'Officer'
          });

          // Regenerate the official PDF approval letter for the parent application with updated renewal info
          try {
            const pdfPath = await generateVisaPdf(parentApp);
            parentApp.pdfUrl = pdfPath;
          } catch (pdfErr) {
            console.error('Error regenerating PDF for renewed visa:', pdfErr);
          }

          // Regenerate QR code for the parent visa so the modal shows an updated QR
          try {
            let frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
            if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
              const localIp = getLocalIp();
              frontendUrl = frontendUrl.replace(/localhost|127\.0\.0\.1/, localIp);
            }
            // Use existing secureToken so old QR scan links still resolve correctly
            const token = parentApp.secureToken;
            if (token) {
              const qrData = `${frontendUrl}/verify?token=${token}`;
              const qrCodeBase64 = await QRCode.toDataURL(qrData);
              parentApp.qrCodeUrl = qrCodeBase64;
            }
          } catch (qrErr) {
            console.error('Error regenerating QR code for renewed visa:', qrErr);
          }

          // Copy first entry & updated stay expiry details onto the renewal sub-application so scanner & token verification get exact dates
          application.entryRecorded = parentApp.entryRecorded || true;
          application.entryStatus = parentApp.entryStatus || 'Entered';
          application.entryDate = parentApp.entryDate;
          application.entryOfficer = parentApp.entryOfficer;
          application.entryPort = parentApp.entryPort;
          application.stayExpiryDate = newExpiry;
          application.expirationDate = newExpiry;
          application.stayDuration = totalRemainingDays;
          application.renewalHistory = parentApp.renewalHistory;
          application.renewalCount = parentApp.renewalCount;

          await parentApp.save();
        }
      }

      // Pre-entry validity setup (calculated from approval date + visa duration days)
      if (!application.issueDate) {
        application.issueDate = new Date();
      }
      application.approvalDate = new Date();
      
      const durationDays = Number(application.visaDuration) || Number(application.stayDuration) || 30;
      const entryValidUntil = new Date(application.approvalDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      application.entryValidUntil = entryValidUntil;
      application.validUntilDate = entryValidUntil;

      // Pre-entry state: entryDate and stayExpiryDate remain null until Border Control records entry
      if (!application.entryRecorded) {
        application.entryDate = null;
        application.stayExpiryDate = null;
      }

      // Generate permanent QR code and secure token ONCE
      if (!application.secureToken) {
        const secureToken = uuidv4();
        application.secureToken = secureToken;

        let frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
          const localIp = getLocalIp();
          frontendUrl = frontendUrl.replace(/localhost|127\.0\.0\.1/, localIp);
        }
        
        const qrData = `${frontendUrl}/verify?token=${secureToken}`;
        const qrCodeBase64 = await QRCode.toDataURL(qrData);
        application.qrCodeUrl = qrCodeBase64;
      }

      // Generate PDF e-Visa letter
      const pdfPath = await generateVisaPdf(application);
      application.pdfUrl = pdfPath;
    } else if (status === 'Rejected') {
      application.rejectionReason = rejectionReason || 'Requirements not met.';
    } else if (status === 'Needs Revision') {
      application.rejectionReason = rejectionReason || 'Please provide additional information.';
    }

    const updated = await application.save();

    // Send Status Update Email asynchronously
    if (application.personalDetails && application.personalDetails.email) {
      const applicantName = `${application.personalDetails.firstName || ''} ${application.personalDetails.lastName || ''}`.trim();
      let emailSubject = '';
      let emailHtml = '';

      if (status === 'Approved') {
        emailSubject = 'Your Somalia E-Visa Has Been Approved';
        emailHtml = emailTemplates.getVisaApprovedTemplate(applicantName);
      } else if (status === 'Rejected') {
        emailSubject = 'Somalia E-Visa Application Update';
        emailHtml = emailTemplates.getVisaRejectedTemplate(applicantName, application.rejectionReason);
      } else if (status === 'Needs Revision') {
        emailSubject = 'Additional Information Required';
        emailHtml = emailTemplates.getNeedsRevisionTemplate(applicantName, application.rejectionReason);
      }

      if (emailHtml) {
        sendEmail({
          email: application.personalDetails.email,
          subject: emailSubject,
          html: emailHtml
        }).catch((emailError) => {
          console.error('Non-fatal error: Failed to send status update email.', emailError);
        });
      }
    }

    await ActivityLog.create({
      officerId: req.user._id,
      officerName: req.user.fullName,
      action: status === 'Approved' ? 'Approved Visa' : status === 'Rejected' ? 'Rejected Visa' : 'Status Update',
      targetId: application._id,
      details: `Changed status to ${status}`,
      ipAddress: req.ip
    });

    res.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// Public Visa Tracking
exports.trackVisa = async (req, res) => {
  try {
    const { referenceId, passportNumber } = req.body;

    if (!referenceId || !passportNumber) {
      return res.status(400).json({ success: false, message: 'Reference ID and Passport Number are required.' });
    }

    const application = await VisaApplication.findById(referenceId);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Visa Application not found.' });
    }

    // Verify passport number
    if (application.personalDetails?.passportNumber !== passportNumber) {
      return res.status(401).json({ success: false, message: 'Invalid Passport Number for this application.' });
    }

    let entryValidUntil = application.entryValidUntil;
    if (!application.entryRecorded && ['Approved', 'Active'].includes(application.applicationStatus)) {
      const durationDays = Number(application.visaDuration) || Number(application.stayDuration) || 30;
      const baseTime = new Date(application.approvalDate || application.issueDate || application.createdAt).getTime();
      entryValidUntil = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
    }

    res.json({
      success: true,
      application: {
        _id: application._id,
        visaType: application.visaType,
        applicationStatus: application.applicationStatus,
        createdAt: application.createdAt,
        approvalDate: application.approvalDate,
        expirationDate: application.expirationDate,
        entryValidUntil: entryValidUntil,
        validUntilDate: entryValidUntil,
        stayExpiryDate: application.stayExpiryDate,
        visaDuration: application.visaDuration,
        rejectionReason: application.rejectionReason,
        personalDetails: {
          firstName: application.personalDetails?.firstName,
          lastName: application.personalDetails?.lastName,
          passportNumber: application.personalDetails?.passportNumber,
          nationality: application.personalDetails?.nationality,
        },
        pdfUrl: application.pdfUrl,
        qrCodeUrl: application.qrCodeUrl
      }
    });

  } catch (error) {
    console.error('Error tracking visa:', error);
    res.status(500).json({ success: false, message: 'Server error tracking visa application.' });
  }
};

exports.verifyTrackVisaOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    const verification = await VerificationCode.findOne({ email, code, type: 'track' });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    const application = await VisaApplication.findOne({ 'personalDetails.email': email });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Visa Application not found.' });
    }

    // Delete code after successful use
    await VerificationCode.deleteOne({ _id: verification._id });

    let otpEntryValidUntil = application.entryValidUntil;
    if (!application.entryRecorded && ['Approved', 'Active'].includes(application.applicationStatus)) {
      const durationDays = Number(application.visaDuration) || Number(application.stayDuration) || 30;
      const baseTime = new Date(application.approvalDate || application.issueDate || application.createdAt).getTime();
      otpEntryValidUntil = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
    }

    res.json({
      success: true,
      application: {
        _id: application._id,
        visaType: application.visaType,
        applicationStatus: application.applicationStatus,
        createdAt: application.createdAt,
        approvalDate: application.approvalDate,
        expirationDate: application.expirationDate,
        entryValidUntil: otpEntryValidUntil,
        validUntilDate: otpEntryValidUntil,
        stayExpiryDate: application.stayExpiryDate,
        visaDuration: application.visaDuration,
        rejectionReason: application.rejectionReason,
        personalDetails: {
          firstName: application.personalDetails?.firstName,
          lastName: application.personalDetails?.lastName,
          passportNumber: application.personalDetails?.passportNumber,
          nationality: application.personalDetails?.nationality,
        },
        pdfUrl: application.pdfUrl,
        qrCodeUrl: application.qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Verify Track Visa OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error tracking visa application.' });
  }
};

// Verify Payment manually (Officer/Finance)
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, amountPaid } = req.body;

    const application = await VisaApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.paymentStatus = paymentStatus; // 'Completed' or 'Failed'
    application.paymentDetails = { transactionId, amountPaid };
    
    const updated = await application.save();

    await ActivityLog.create({
      officerId: req.user._id,
      officerName: req.user.fullName,
      action: 'Verified Payment',
      targetId: application._id,
      details: `Marked payment as ${paymentStatus}`,
      ipAddress: req.ip
    });

    res.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};

// Record Border Entry
exports.recordEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (application.entryRecorded) {
      return res.status(400).json({ success: false, message: 'Entry has already been recorded for this visa.' });
    }

    if (application.applicationStatus !== 'Approved' && application.applicationStatus !== 'Active') {
      return res.status(400).json({ success: false, message: 'Visa is not approved.' });
    }

    const validUntil = application.entryValidUntil || application.validUntilDate || application.expirationDate;
    if (validUntil && new Date() > new Date(validUntil)) {
      return res.status(400).json({ success: false, message: 'Visa entry validity window has expired. Entry denied.' });
    }

    const entryDate = new Date();
    const duration = application.stayDuration || application.visaDuration || 30;
    const stayExpiryDate = new Date(entryDate.getTime() + duration * 24 * 60 * 60 * 1000);

    application.entryRecorded = true;
    application.entryStatus = 'Entered';
    application.applicationStatus = 'Active';
    application.entryDate = entryDate;
    application.stayExpiryDate = stayExpiryDate;
    application.expirationDate = stayExpiryDate; // Legacy fallback
    application.entryOfficer = (req.user && req.user.fullName) ? req.user.fullName : 'Border Control Officer';
    application.entryPort = req.body.location || req.body.port || 'Mogadishu International Airport (MGQ)';

    application.scannedHistory.push({
      action: 'Entry',
      officerId: req.user ? req.user._id : undefined,
      location: application.entryPort
    });
    
    const updated = await application.save();

    // Sync entry details to parent or child renewals
    if (application.linkedApplicationId) {
      await VisaApplication.findByIdAndUpdate(application.linkedApplicationId, {
        entryRecorded: true,
        entryStatus: 'Entered',
        applicationStatus: 'Active',
        entryDate,
        stayExpiryDate,
        expirationDate: stayExpiryDate,
        entryOfficer: application.entryOfficer,
        entryPort: application.entryPort
      });
    } else {
      await VisaApplication.updateMany({ linkedApplicationId: application._id }, {
        entryRecorded: true,
        entryStatus: 'Entered',
        applicationStatus: 'Active',
        entryDate,
        stayExpiryDate,
        expirationDate: stayExpiryDate,
        entryOfficer: application.entryOfficer,
        entryPort: application.entryPort
      });
    }

    if (req.user) {
      await ActivityLog.create({
        officerId: req.user._id,
        officerName: req.user.fullName,
        action: 'Recorded Entry',
        targetId: application._id,
        details: `Recorded entry at ${application.entryPort}. Permitted stay until ${stayExpiryDate.toLocaleDateString()}`,
        ipAddress: req.ip
      });
    }

    res.json({ success: true, application: updated, message: 'First entry recorded successfully. Visa is now Active.' });
  } catch (error) {
    console.error('Error recording entry:', error);
    res.status(500).json({ success: false, message: 'Server error recording entry: ' + error.message });
  }
};

// Record Border Exit
exports.recordExit = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.entryStatus = 'Exited';
    application.exitDate = new Date();
    
    const location = req.body.location || 'Mogadishu International Airport';
    application.scannedHistory.push({
      action: 'Exit',
      officerId: req.user ? req.user._id : undefined,
      location: location
    });
    
    const updated = await application.save();

    // Sync exit details to parent or child renewals
    if (application.linkedApplicationId) {
      await VisaApplication.findByIdAndUpdate(application.linkedApplicationId, {
        entryStatus: 'Exited',
        exitDate: application.exitDate
      });
    } else {
      await VisaApplication.updateMany({ linkedApplicationId: application._id }, {
        entryStatus: 'Exited',
        exitDate: application.exitDate
      });
    }

    if (req.user) {
      await ActivityLog.create({
        officerId: req.user._id,
        officerName: req.user.fullName,
        action: 'Recorded Exit',
        targetId: application._id,
        details: `Recorded exit at ${location}`,
        ipAddress: req.ip
      });
    }

    res.json({ success: true, application: updated, message: 'Exit recorded successfully.' });
  } catch (error) {
    console.error('Error recording exit:', error);
    res.status(500).json({ success: false, message: 'Server error recording exit' });
  }
};

// Check for Overstays
exports.checkOverstays = async (req, res) => {
  try {
    const now = new Date();
    
    const overstayedApps = await VisaApplication.find({
      entryStatus: 'Entered',
      $or: [
        { stayExpiryDate: { $lt: now } },
        // Catch records where stayExpiryDate is null OR completely absent (old records)
        // $exists: false alone misses null values; this covers both cases
        { stayExpiryDate: { $in: [null] }, expirationDate: { $lt: now } },
        { stayExpiryDate: { $exists: false }, expirationDate: { $lt: now } }
      ],
      overstayAlert: { $ne: true }
    }).select('_id');

    const newOverstayIds = overstayedApps.map(app => app._id);
    
    if (newOverstayIds.length > 0) {
      await VisaApplication.updateMany(
        { _id: { $in: newOverstayIds } },
        { 
          $set: { 
            overstayAlert: true, 
            entryStatus: 'Overstayed',
            applicationStatus: 'Overstayed'
          } 
        }
      );

      if (req.user && req.user.role === 'officer') {
        await ActivityLog.create({
          officerId: req.user._id,
          officerName: req.user.fullName,
          action: 'Ran Overstay Check',
          details: `Found ${newOverstayIds.length} new overstays`,
          ipAddress: req.ip
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Overstay check complete. Found ${newOverstayIds.length} new overstays.`,
      newOverstaysCount: newOverstayIds.length,
      newOverstayIds
    });
  } catch (error) {
    console.error('Error checking overstays:', error);
    res.status(500).json({ success: false, message: 'Server error checking overstays' });
  }
};

// Verify Visa via QR Token
exports.verifyVisaToken = async (req, res) => {
  try {
    const { token } = req.params;
    let query = { secureToken: token };
    if (token.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ secureToken: token }, { _id: token }] };
    } else {
      query = { $or: [{ secureToken: token }, { 'personalDetails.passportNumber': token.trim().toUpperCase() }] };
    }
    const application = await VisaApplication.findOne(query);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Invalid or unrecognized visa token.' });
    }

    // If this application is linked to a parent application (renewal sub-app) or if parent app exists
    let parentApp = null;
    if (application.linkedApplicationId) {
      parentApp = await VisaApplication.findById(application.linkedApplicationId);
    }

    const isOfficer = req.user && req.user.role !== 'applicant';

    if (isOfficer) {
      application.scannedHistory.push({
        action: 'Scan',
        officerId: req.user._id,
        location: req.query.location || 'System Dashboard'
      });
      await application.save();
    }

    const appObj = application.toObject ? application.toObject() : JSON.parse(JSON.stringify(application));

    // Resolve entryRecorded, entryDate, stayExpiryDate from parent if present
    const firstEntryDate = appObj.entryDate || parentApp?.entryDate || null;
    const entryPort = appObj.entryPort || parentApp?.entryPort || 'Mogadishu Intl Airport';
    const entryOfficer = appObj.entryOfficer || parentApp?.entryOfficer || 'Border Control';
    const entryStatus = appObj.entryStatus || parentApp?.entryStatus || 'Entered';
    const stayExpiryDate = appObj.stayExpiryDate || parentApp?.stayExpiryDate || appObj.expirationDate || parentApp?.expirationDate || null;
    const stayDuration = appObj.stayDuration || parentApp?.stayDuration || appObj.visaDuration || 30;
    const renewalHistory = (appObj.renewalHistory && appObj.renewalHistory.length > 0)
      ? appObj.renewalHistory
      : (parentApp?.renewalHistory || []);
    const renewalCount = appObj.renewalCount || parentApp?.renewalCount || renewalHistory.length;

    const isEntryRecorded = !!appObj.entryRecorded || !!parentApp?.entryRecorded || !!firstEntryDate || renewalCount > 0 || ['Entered', 'Overstayed', 'Exited'].includes(entryStatus);

    const now = new Date();
    let isExpired = false;
    let remainingDays = 0;

    if (!isEntryRecorded) {
      // Pre-entry: check entry validity window
      const validUntil = appObj.entryValidUntil || appObj.validUntilDate;
      if (validUntil && now > new Date(validUntil)) {
        isExpired = true;
      }
    } else {
      // Post-entry: check stay expiry date
      if (stayExpiryDate) {
        if (now > new Date(stayExpiryDate)) {
          isExpired = true;
          remainingDays = 0;
        } else {
          remainingDays = Math.max(0, Math.ceil((new Date(stayExpiryDate) - now) / (1000 * 60 * 60 * 24)));
        }
      }
    }

    appObj.entryRecorded = isEntryRecorded;
    appObj.entryDate = firstEntryDate;
    appObj.entryPort = entryPort;
    appObj.entryOfficer = entryOfficer;
    appObj.entryStatus = entryStatus;
    appObj.stayExpiryDate = stayExpiryDate;
    appObj.stayDuration = stayDuration;
    appObj.renewalHistory = renewalHistory;
    appObj.renewalCount = renewalCount;
    appObj.isExpired = isExpired;
    appObj.remainingDays = remainingDays;

    return res.json({
      success: true,
      isOfficer: !!isOfficer,
      application: appObj
    });
  } catch (error) {
    console.error('Error verifying visa token:', error);
    res.status(500).json({ success: false, message: 'Server error verifying visa token.' });
  }
};

// Send Overstay Warning Email
exports.sendWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplication.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (!application.overstayAlert) {
      return res.status(400).json({ success: false, message: 'Applicant is not flagged for overstay.' });
    }

    const email = application.personalDetails?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'No email address found for this applicant.' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">URGENT: Visa Overstay Warning</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${application.personalDetails.firstName},</p>
          <p>Our border control records indicate that your visa has <strong>expired</strong> as of ${new Date(application.expirationDate).toLocaleDateString()}, and you have not recorded an exit from Somalia.</p>
          <p><strong>Overstaying a visa is a serious violation of immigration laws.</strong></p>
          <p>Please contact the immigration department immediately to resolve your status or arrange for your departure. Failure to do so may result in fines, detention, or future travel bans.</p>
          <br/>
          <p>Sincerely,</p>
          <p><strong>Somalia Immigration Authority</strong></p>
        </div>
      </div>
    `;

    const sendEmail = require('../utils/sendEmail');
    sendEmail({
      email: email,
      subject: 'URGENT: Visa Overstay Warning',
      html: htmlContent
    }).catch((emailError) => {
      console.error('Non-fatal error: Failed to send warning email.', emailError);
    });

    // Update lastWarningSentAt
    application.lastWarningSentAt = new Date();
    await application.save();

    // Optional: Log this action
    if (req.user && req.user.role === 'officer') {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        officerId: req.user._id,
        officerName: req.user.fullName,
        action: 'Sent Overstay Warning',
        details: `Sent warning email to ${application.personalDetails.firstName} (Visa ID: ${application._id})`,
        ipAddress: req.ip
      });
    }

    res.json({ success: true, message: 'Warning email sent successfully.' });

  } catch (error) {
    console.error('Error sending warning:', error);
    res.status(500).json({ success: false, message: 'Server error sending warning email.' });
  }
};

// Get Reports & Analytics
exports.getReports = async (req, res) => {
  try {
    // Sync all overstayAlert records so applicationStatus and entryStatus accurately reflect 'Overstayed'
    await VisaApplication.updateMany(
      { overstayAlert: true, applicationStatus: { $ne: 'Overstayed' } },
      { $set: { applicationStatus: 'Overstayed', entryStatus: 'Overstayed' } }
    );

    const revenueStats = await VisaApplication.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: "$visaType", totalRevenue: { $sum: { $ifNull: ["$paymentDetails.amountPaid", 100] } } } }
    ]);
    
    const typeStats = await VisaApplication.aggregate([
      { $group: { _id: "$applicationType", count: { $sum: 1 } } }
    ]);

    const statusStats = await VisaApplication.aggregate([
      { $group: { _id: "$applicationStatus", count: { $sum: 1 } } }
    ]);

    const overstayStats = await VisaApplication.aggregate([
      { $match: { overstayAlert: true } },
      { $group: { _id: "$visaType", count: { $sum: 1 } } }
    ]);

    res.json({ success: true, reports: { revenueStats, typeStats, statusStats, overstayStats } });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ success: false, message: 'Server error generating reports' });
  }
};
