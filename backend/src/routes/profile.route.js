const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// GET profile
router.get('/', profileController.getProfile);

// UPDATE profile
router.put('/', profileController.updateProfile);

// CHANGE password
router.put('/change-password', profileController.changePassword);

module.exports = router;
