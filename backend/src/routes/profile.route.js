const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../config/upload'); // ✅ THÊM IMPORT UPLOAD

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// GET profile
router.get('/', profileController.getProfile);

// ✅ UPDATE profile - THÊM UPLOAD MIDDLEWARE
router.put('/', upload.single('resume'), profileController.updateProfile);

// CHANGE password
router.put('/change-password', profileController.changePassword);

module.exports = router;