const express = require('express');
const router = express.Router();
const monthlySavingsTierController = require('../controllers/monthlySavingsTierController');
const { protect } = require('../utils/authMiddleware');

// All monthly savings tier routes are protected
router.use(protect);

// User-specific routes
router.get('/current', monthlySavingsTierController.getCurrentMonthTier);
router.get('/history', monthlySavingsTierController.getMonthlyTiersHistory);
router.post('/calculate', monthlySavingsTierController.calculateCurrentMonthTier);
router.get('/stats', monthlySavingsTierController.getTierStats);

// Admin routes (commented out for now)
// router.get('/admin/all', monthlySavingsTierController.getAllUsersMonthlyTiers);

module.exports = router;
