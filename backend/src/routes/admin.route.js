const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Tất cả route đều cần đăng nhập và là admin
router.use(authenticate);
router.use(authorize('admin'));

// Statistics
router.get('/statistics', adminController.getStatistics);

// Employers
router.get('/employers', adminController.getAllEmployers);
router.get('/employers/pending', adminController.getPendingEmployers);
router.put('/employers/:employerId/verify', adminController.verifyEmployer);
router.put('/employers/:employerId/reject', adminController.rejectEmployer);

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:role/:userId/reset-password', adminController.resetUserPasswordByAdmin);
router.put('/users/:role/:userId/toggle-status', adminController.toggleUserStatus);

// Jobs
router.get('/jobs', adminController.getAllJobs);
router.get('/jobs/:jobId', adminController.getJobDetailForAdmin);
router.patch('/jobs/:jobId/toggle-status', adminController.toggleJobStatusByAdmin);

// Reports
router.get('/reports', adminController.getAllReports);
router.get('/reports/:reportId', adminController.getReportDetail);
router.patch('/reports/:reportId/status', adminController.updateReportStatus);

module.exports = router;