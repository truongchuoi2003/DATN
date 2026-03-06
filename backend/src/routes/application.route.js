const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Student
router.get('/my-stats', authorize('student'), applicationController.getMyApplicationStats);
router.post('/', authorize('student'), applicationController.applyForJob);
router.get('/my-applications', authorize('student'), applicationController.getMyApplications);
router.get('/check/:jobId', authorize('student'), applicationController.checkIfApplied);
router.put('/:applicationId/withdraw', authorize('student'), applicationController.withdrawApplication);

// Employer
router.get('/employer/stats', authorize('employer'), applicationController.getEmployerApplicationStats);
router.get('/job/:jobId', authorize('employer'), applicationController.getJobApplications);
router.get('/employer', authorize('employer'), applicationController.getEmployerApplications);
router.put('/:applicationId/status', authorize('employer'), applicationController.updateApplicationStatus);
router.put('/:applicationId/note', authorize('employer'), applicationController.updateEmployerNote);

// Shared detail route
router.get('/:applicationId', authorize('student', 'employer', 'admin'), applicationController.getApplicationDetail);

module.exports = router;