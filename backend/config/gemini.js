// Gemini API configuration
require('dotenv').config();

module.exports = {
  apiKey: process.env.GEMINI_API_KEY,
  endpoint: process.env.GEMINI_API_ENDPOINT,
};
