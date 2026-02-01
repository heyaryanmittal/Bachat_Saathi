const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

// Email debug endpoints
router.get('/send-test-email', debugController.sendTestEmail);
router.get('/verify-smtp', debugController.verifySmtp);

// Leaderboard debug endpoints
router.post('/populate-leaderboard', debugController.populateLeaderboard);
router.get('/leaderboard-stats', debugController.getLeaderboardStats);
router.post('/recalculate-leaderboard', debugController.recalculateLeaderboard);
router.post('/reset-monthly-leaderboard', debugController.resetMonthlyLeaderboard);

module.exports = router;

