const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../utils/authMiddleware');

// All user routes are protected
router.use(protect);

// Points system routes
router.get('/points', userController.getUserPoints);
router.get('/points/history', userController.getPointsHistory);
router.get('/achievements', userController.getUserAchievements);

// Usage statistics route
router.get('/usage-stats', userController.getUserUsageStats);

// Future admin routes (commented out for now)
// router.get('/admin/points', userController.getAllUsersPoints);

module.exports = router;
