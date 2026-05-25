const express = require('express');
const router = express.Router();
const visaController = require('../controllers/visaController');
const { protect, officerOnly, authOptional } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Submit new visa application with document uploads
router.post('/apply', protect, upload.fields([
  { name: 'passportDocument', maxCount: 1 },
  { name: 'photoDocument', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 }
]), visaController.applyVisa);

// Fetch current applicant's applications
router.get('/my-applications', protect, visaController.getMyApplications);

// Fetch all applications (Officer view)
router.get('/all', protect, officerOnly, visaController.getAllApplications);

// Update status (Officer action)
router.put('/:id/status', protect, officerOnly, visaController.updateStatus);

// Public Visa Tracking
router.post('/track', visaController.trackVisa);

// QR Code Public/Officer Verification
router.get('/verify/:token', authOptional, visaController.verifyVisaToken);

// Verify Payment
router.put('/:id/verify-payment', protect, officerOnly, visaController.verifyPayment);

// Border Control
router.post('/:id/entry', protect, officerOnly, visaController.recordEntry);
router.post('/:id/exit', protect, officerOnly, visaController.recordExit);

// Overstays
router.post('/check-overstays', protect, officerOnly, visaController.checkOverstays);

module.exports = router;
