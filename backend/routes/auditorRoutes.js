const express = require('express');
const router = express.Router();
const { protect, auditorOnly } = require('../middlewares/authMiddleware');
const auditorController = require('../controllers/auditorController');

// All auditor routes are protected and auditorOnly
router.use(protect);
router.use(auditorOnly);

router.get('/overview', auditorController.getOverviewStats);
router.get('/applications', auditorController.getAllApplications);
router.get('/activity-logs', auditorController.getActivityLogs);

module.exports = router;
