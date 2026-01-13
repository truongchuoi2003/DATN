const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');
const upload = require('../config/upload');

// protected endpoints
router.get('/me', protect, profileController.getMyProfile);
router.put('/me', protect, profileController.updateMyProfile);

// uploads
router.post('/me/upload-resume', protect, upload.single('file'), profileController.uploadResume);
router.post('/me/upload-logo', protect, upload.single('file'), profileController.uploadLogo);

module.exports = router;
