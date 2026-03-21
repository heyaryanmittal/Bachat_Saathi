const express = require('express');
const router = express.Router();
const { getGeminiResponse } = require('../controllers/aiAssistantController');
router.post('/gemini', getGeminiResponse);
module.exports = router;
