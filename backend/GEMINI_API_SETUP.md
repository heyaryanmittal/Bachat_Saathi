# Gemini 2.5 Flash API Integration Instructions


1. **Get Your API Key**
  - Sign up at [Google AI Studio](https://aistudio.google.com/) and create a Gemini API key.

2. **Set Up Environment Variables**
  - In your backend `.env` file, add:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    ```

3. **Configuration**
  - The Gemini config is in `backend/config/gemini.js` and loads your API key and endpoint from `.env`.

4. **Gemini Service**
  - Use the service in `backend/services/geminiService.js`:
    ```js
    const { generateGeminiContent } = require('./services/geminiService');
    // Example usage:
    const result = await generateGeminiContent([{ parts: [{ text: 'Your prompt here' }] }]);
    ```

5. **Security**
  - Never commit your API key to source control.
  - Use environment variables for sensitive data.

6. **Dependencies**
  - Ensure `axios` and `dotenv` are installed:
    ```bash
    npm install axios dotenv
    ```

---

For any issues, check logs or contact the maintainer.
