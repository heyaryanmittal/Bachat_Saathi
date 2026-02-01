const axios = require('axios');
const { apiKey, endpoint } = require('../config/gemini');

// messages: array of Gemini message objects, e.g., [{ parts: [{ text: 'your prompt' }] }]
async function generateGeminiContent(messages) {
  try {
    const response = await axios.post(
      `${endpoint}?key=${apiKey}`,
      {
        contents: messages,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  generateGeminiContent,
};