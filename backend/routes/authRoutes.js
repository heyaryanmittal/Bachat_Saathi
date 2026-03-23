const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../utils/authMiddleware');

router.post('/signup/request-otp', authController.signupRequestOtp);
router.post('/signup/verify-otp', authController.signupVerifyOtp);
router.post('/login-2fa', authController.login2FAVerify);
router.post('/2fa/send-otp', protect, authController.send2FAOtp);
router.post('/2fa/verify-otp', protect, authController.verify2FAOtp);
router.get('/2fa/status', protect, authController.get2FAStatus);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
module.exports = router;
