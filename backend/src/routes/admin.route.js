const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Tất cả route đều cần đăng nhập và là admin
router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

// Statistics
router.get('/statistics', adminController.getStatistics);

// Employers
router.get('/employers', adminController.getAllEmployers);
router.get('/employers/pending', adminController.getPendingEmployers);
router.put('/employers/:employerId/verify', adminController.verifyEmployer);
router.put('/employers/:employerId/reject', adminController.rejectEmployer);

// Users
router.get('/users', adminController.getAllUsers);

module.exports = router;