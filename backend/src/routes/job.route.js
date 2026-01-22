const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// ✅ QUAN TRỌNG: THỨ TỰ ĐÚNG
// Routes cụ thể phải đứng TRƯỚC routes động (:jobId)

// 1. Statistics
router.get('/statistics', authorize('employer'), jobController.getJobStatistics);

// 2. My jobs
router.get('/my-jobs', authorize('employer'), jobController.getMyJobs);

// 3. Create job
router.post('/', authorize('employer'), jobController.createJob);

// 4. Toggle status (phải đứng TRƯỚC /:jobId)
router.patch('/:jobId/toggle-status', authorize('employer'), jobController.toggleJobStatus);

// 5. Update (phải đứng TRƯỚC GET /:jobId)
router.put('/:jobId', authorize('employer'), jobController.updateJob);

// 6. Delete (phải đứng TRƯỚC GET /:jobId)
router.delete('/:jobId', authorize('employer'), jobController.deleteJob);

// 7. Get by ID (ĐẶT CUỐI CÙNG)
router.get('/:jobId', authorize('employer'), jobController.getJobById);

module.exports = router;