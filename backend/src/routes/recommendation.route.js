const express = require('express');
const router = express.Router();

const recommendationController = require('../controllers/recommendation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Chỉ student được dùng
router.get(
  '/jobs',
  authenticate,
  authorize('student'),
  recommendationController.getRecommendedJobs
);

module.exports = router;