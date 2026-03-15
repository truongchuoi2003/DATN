const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../config/upload');

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// GET profile
router.get('/', profileController.getProfile);

// ✅ hỗ trợ nhiều field file cùng lúc
router.put(
  '/',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  profileController.updateProfile
);

// CHANGE password
router.put('/change-password', profileController.changePassword);

module.exports = router;