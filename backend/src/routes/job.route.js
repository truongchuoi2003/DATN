const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ========================================
// PUBLIC ROUTES - KHÔNG CẦN LOGIN
// ========================================
router.get('/public', jobController.getAllPublicJobs);
router.get('/public/:jobId', jobController.getPublicJobDetail);

// ========================================
// AUTHENTICATED ROUTES - CẦN ĐĂNG NHẬP
// ========================================
router.use(authenticate);

router.get('/statistics', authorize('employer'), jobController.getJobStatistics);
router.get('/my-jobs', authorize('employer'), jobController.getMyJobs);
router.post('/', authorize('employer'), jobController.createJob);
router.patch('/:jobId/toggle-status', authorize('employer'), jobController.toggleJobStatus);
router.put('/:jobId', authorize('employer'), jobController.updateJob);
router.delete('/:jobId', authorize('employer'), jobController.deleteJob);
router.get('/:jobId', authorize('employer'), jobController.getJobById);

module.exports = router;