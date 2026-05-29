const VisaApplication = require('../models/VisaApplication');
const VerificationCode = require('../models/VerificationCode');
const sendEmail = require('../utils/sendEmail');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { generateVisaPdf } = require('../utils/pdfGenerator');
const ActivityLog = require('../models/ActivityLog');

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

    // Retrieve file paths from multer uploads
    const passportDocument = req.files && req.files.passportDocument ? req.files.passportDocument[0].filename : null;
    const photoDocument = req.files && req.files.photoDocument ? req.files.photoDocument[0].filename : null;
    const supportingDocument = req.files && req.files.supportingDocument ? req.files.supportingDocument[0].filename : null;

    // Parse JSON details if sent as strings (via FormData)
    const parsedPersonalDetails = typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails;
    const parsedTravelDetails = typeof travelDetails === 'string' ? JSON.parse(travelDetails) : travelDetails;

    // --- DOCUMENT VERIFICATION WORKFLOW ---
    const passportNumber = parsedPersonalDetails?.passportNumber;
    
    if (passportNumber) {
      // 2. Duplicate passport detection (Check if there is an active application)
      const existingApp = await VisaApplication.findOne({ 
        'personalDetails.passportNumber': passportNumber,
        applicationStatus: { $in: ['Submitted', 'Under Review', 'Needs Revision'] }
      });
      
      if (existingApp) {
        return res.status(400).json({ success: false, message: 'An active application with this passport number already exists.' });
      }
    }
    // ---------------------------------------

    const newApplication = new VisaApplication({
      applicantId: req.user._id,
      visaType: visaType || 'Tourism',
      purposeOfTravel: purposeOfTravel || 'Not Specified',
      passportNumber: passportNumber || '',
      passportDocument,
      supportingDocuments: [photoDocument, supportingDocument].filter(Boolean),
      personalDetails: parsedPersonalDetails || {},
      travelDetails: parsedTravelDetails || {},
      paymentStatus: paymentStatus || 'Completed', 
      paymentDetails: {
        amountPaid: amountPaid ? Number(amountPaid) : 0,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      visaDuration: visaDuration ? Number(visaDuration) : null,
      applicationStatus: 'Submitted'
    });

    const savedApplication = await newApplication.save();

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
    res.status(500).json({ success: false, message: 'Server error creating visa application' });
  }
};

// Get current applicant's visa applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await VisaApplication.find({ applicantId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applicant visas:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

// Get all applications (Officer view)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await VisaApplication.find()
      .populate('applicantId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
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
      application.approvalDate = new Date();
      const duration = visaDuration ? parseInt(visaDuration) : (application.visaDuration || 30);
      application.visaDuration = duration;
      
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + duration);
      application.expirationDate = expDate;

      // Generate a verification QR code and secure token
      const secureToken = uuidv4();
      application.secureToken = secureToken;

      const name = application.personalDetails ? `${application.personalDetails.firstName || ''} ${application.personalDetails.lastName || ''}`.trim() : 'N/A';
      // The QR payload is JUST the verification URL so mobile phones will directly open it.
      const qrData = `http://192.168.100.159:5173/verify?token=${secureToken}`;
      
      const qrCodeBase64 = await QRCode.toDataURL(qrData);
      application.qrCodeUrl = qrCodeBase64;

      // Generate the official PDF e-Visa approval letter
      const pdfPath = await generateVisaPdf(application);
      application.pdfUrl = pdfPath;
    } else if (status === 'Rejected') {
      application.rejectionReason = rejectionReason || 'Requirements not met.';
    }

    const updated = await application.save();

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
    const { email, passportNumber } = req.body;

    if (!email || !passportNumber) {
      return res.status(400).json({ success: false, message: 'Email Address and Passport Number are required.' });
    }

    const application = await VisaApplication.findOne({ 
      'personalDetails.email': email
    });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Visa Application not found.' });
    }

    // Verify passport number
    if (application.personalDetails?.passportNumber !== passportNumber) {
      return res.status(401).json({ success: false, message: 'Invalid Passport Number for this application.' });
    }

    // Instead of returning data, send OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60000); // 2 minutes

    await VerificationCode.deleteMany({ email, type: 'track' });

    await VerificationCode.create({
      email,
      code,
      type: 'track',
      expiresAt
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e3a8a; text-align: center;">Visa Tracking Verification</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello ${application.personalDetails.firstName},</p>
        <p style="color: #4b5563; font-size: 16px;">Someone is trying to track your visa application. Please use the verification code below to view your status.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e3a8a;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 2 minutes.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Somalia E-Visa - Tracking Verification Code',
      html: emailHtml
    });

    res.json({ success: true, requires_otp: true, email, message: 'Verification code sent to your email.' });

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

    res.json({
      success: true,
      application: {
        _id: application._id,
        visaType: application.visaType,
        applicationStatus: application.applicationStatus,
        createdAt: application.createdAt,
        approvalDate: application.approvalDate,
        expirationDate: application.expirationDate,
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
    
    if (application.applicationStatus !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Visa is not approved.' });
    }

    if (new Date() > new Date(application.expirationDate)) {
      return res.status(400).json({ success: false, message: 'Visa has expired.' });
    }

    application.entryStatus = 'Entered';
    application.entryDate = new Date();
    
    const location = req.body.location || 'Mogadishu International Airport'; // Default location
    application.scannedHistory.push({
      action: 'Entry',
      officerId: req.user._id,
      location: location
    });
    
    const updated = await application.save();

    await ActivityLog.create({
      officerId: req.user._id,
      officerName: req.user.fullName,
      action: 'Recorded Entry',
      targetId: application._id,
      details: `Recorded entry at ${location}`,
      ipAddress: req.ip
    });

    res.json({ success: true, application: updated, message: 'Entry recorded successfully.' });
  } catch (error) {
    console.error('Error recording entry:', error);
    res.status(500).json({ success: false, message: 'Server error recording entry' });
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
    
    const location = req.body.location || 'Mogadishu International Airport'; // Default location
    application.scannedHistory.push({
      action: 'Exit',
      officerId: req.user._id,
      location: location
    });
    
    const updated = await application.save();

    await ActivityLog.create({
      officerId: req.user._id,
      officerName: req.user.fullName,
      action: 'Recorded Exit',
      targetId: application._id,
      details: `Recorded exit at ${location}`,
      ipAddress: req.ip
    });

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
    
    // Find visas that are Entered, but expirationDate is in the past
    const overstayedVisas = await VisaApplication.find({
      entryStatus: 'Entered',
      expirationDate: { $lt: now },
      overstayAlert: false
    });

    for (let visa of overstayedVisas) {
      visa.overstayAlert = true;
      visa.entryStatus = 'Overstayed';
      await visa.save();
    }

    if (req.user && req.user.role === 'officer') {
      await ActivityLog.create({
        officerId: req.user._id,
        officerName: req.user.fullName,
        action: 'Ran Overstay Check',
        details: `Found ${overstayedVisas.length} new overstays`,
        ipAddress: req.ip
      });
    }

    res.json({ 
      success: true, 
      message: `Overstay check complete. Found ${overstayedVisas.length} new overstays.`,
      newOverstays: overstayedVisas
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
    const application = await VisaApplication.findOne({ secureToken: token });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Invalid or unrecognized visa token.' });
    }

    // Determine if requester is an authenticated officer
    const isOfficer = req.user && req.user.role === 'officer';

    if (isOfficer) {
      // Record the scan in history
      application.scannedHistory.push({
        action: 'Scan',
        officerId: req.user._id,
        location: req.query.location || 'System Dashboard'
      });
      await application.save();

      // Return full officer-level details
      return res.json({
        success: true,
        isOfficer: true,
        application: application
      });
    } else {
      // Public Verification - Return limited data
      return res.json({
        success: true,
        isOfficer: false,
        application: {
          _id: application._id,
          visaType: application.visaType,
          applicationStatus: application.applicationStatus,
          visaDuration: application.visaDuration,
          approvalDate: application.approvalDate,
          expirationDate: application.expirationDate,
          personalDetails: {
            firstName: application.personalDetails?.firstName,
            lastName: application.personalDetails?.lastName
          }
        }
      });
    }

  } catch (error) {
    console.error('Error verifying visa token:', error);
    res.status(500).json({ success: false, message: 'Server error verifying visa token.' });
  }
};
