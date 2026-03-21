const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const insightController = require('../controllers/insightController');
const aiAssistantController = require('../controllers/aiAssistantController');
router.get('/', auth, insightController.getFinancialInsights);
router.get('/goals', auth, insightController.getGoalsProgress);
router.post('/assistant/chat', auth, aiAssistantController.chatWithAssistant);
module.exports = router;
