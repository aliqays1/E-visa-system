const express = require('express');
const router = express.Router();
const visaController = require('../controllers/visaController');
const visaConfigController = require('../controllers/visaConfigController');
const { protect, officerOnly, authOptional, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Submit new visa application with document uploads
router.post('/apply', protect, upload.fields([
  { name: 'passportDocument', maxCount: 1 },
  { name: 'photoDocument', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 },
  { name: 'admissionDocument', maxCount: 1 }
]), visaController.applyVisa);

// Submit a renewal application (with optional document/details updates)
router.post('/renew', protect, upload.fields([
  { name: 'passportDocument', maxCount: 1 },
  { name: 'photoDocument', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 },
  { name: 'admissionDocument', maxCount: 1 }
]), visaController.renewVisa);

// Visa Configs
router.get('/config', visaConfigController.getConfigs);
router.post('/config', protect, officerOnly, visaConfigController.upsertConfig);
router.put('/config/:oldVisaType/rename', protect, officerOnly, visaConfigController.renameConfig);
router.put('/config/:visaType', protect, officerOnly, visaConfigController.upsertConfig);
router.delete('/config/:visaType', protect, officerOnly, visaConfigController.deleteConfig);

// Fetch current applicant's applications
router.get('/my-applications', protect, visaController.getMyApplications);

// Fetch stats (Officer view)
router.get('/stats', protect, officerOnly, visaController.getStats);

// Fetch reports (Admin view)
router.get('/reports', protect, officerOnly, visaController.getReports);

// Fetch all applications (Officer view)
router.get('/all', protect, officerOnly, visaController.getAllApplications);

// Update application (Applicant action when Needs Revision)
router.put('/:id/update', protect, upload.fields([
  { name: 'passportDocument', maxCount: 1 },
  { name: 'photoDocument', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 },
  { name: 'admissionDocument', maxCount: 1 }
]), visaController.updateApplication);

// Update status (Officer action)
router.put('/:id/status', protect, officerOnly, visaController.updateStatus);

// Public Visa Tracking
router.post('/track', visaController.trackVisa);
router.post('/verify-track', visaController.verifyTrackVisaOtp);

// QR Code Public/Officer Verification
router.get('/verify/:token', authOptional, visaController.verifyVisaToken);

// Verify Payment
router.put('/:id/verify-payment', protect, officerOnly, visaController.verifyPayment);

// Border Control
router.post('/:id/entry', protect, officerOnly, visaController.recordEntry);
router.post('/:id/exit', protect, officerOnly, visaController.recordExit);

// Overstays
router.post('/check-overstays', protect, officerOnly, visaController.checkOverstays);
router.post('/:id/send-warning', protect, officerOnly, visaController.sendWarning);

module.exports = router;
