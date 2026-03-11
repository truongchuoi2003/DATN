const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Employer report candidate
router.post(
  '/employer/candidate',
  authorize('employer'),
  reportController.employerReportCandidate
);

router.post(
  '/student/job',
  authorize('student'),
  reportController.studentReportJob
);

router.post(
  '/student/employer',
  authorize('student'),
  reportController.studentReportEmployer
);
module.exports = router;