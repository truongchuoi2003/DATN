const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// 📊 Statistics (Student)
router.get('/my-stats', authorize('student'), applicationController.getMyApplicationStats);

// 📋 Student routes
router.post('/', authorize('student'), applicationController.applyForJob);
router.get('/my-applications', authorize('student'), applicationController.getMyApplications);
router.put('/:applicationId/withdraw', authorize('student'), applicationController.withdrawApplication);


// 📋 Employer routes
router.get('/job/:jobId', authorize('employer'), applicationController.getJobApplications);
router.put('/:applicationId/status', authorize('employer'), applicationController.updateApplicationStatus);

module.exports = router;