const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../utils/authMiddleware');
const { sendTestEmail } = require('../utils/emailService');
router.post('/signup/request-otp', authController.signupRequestOtp);
router.post('/signup/verify-otp', authController.signupVerifyOtp);
router.post('/login-2fa', authController.login2FAVerify);
router.post('/2fa/send-otp', protect, authController.send2FAOtp);
router.post('/2fa/verify-otp', protect, authController.verify2FAOtp);
router.get('/2fa/status', protect, authController.get2FAStatus);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/test-email', async (req, res) => {
  try {
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
    if (!testEmail) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No test email configured. Set TEST_EMAIL in .env' 
      });
    }
    const result = await sendTestEmail(testEmail);
    res.json({
      status: 'success',
      message: 'Test email sent',
      previewUrl: result.previewUrl
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message
    });
  }
});
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
module.exports = router;
