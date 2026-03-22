const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const { 
  sendSignupOtpEmail, 
  sendWelcomeEmail, 
  send2FAOtpEmail, 
  sendPasswordChanged 
} = require('../utils/emailService');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

exports.signupRequestOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser && existingUser.passwordHash) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This email is already registered. Please login instead.' 
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email format' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); 

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, passwordHash: '', signupOTP: otp, signupOTPExpiry: expiry });
    } else {
      user.signupOTP = otp;
      user.signupOTPExpiry = expiry;
    }
    await user.save();

    const emailResult = await sendSignupOtpEmail(email, { name, otp });
    if (!emailResult.ok) {
      return res.status(400).json({ status: 'error', message: 'Failed to send OTP. Please check your email address.' });
    }

    res.json({ status: 'success', message: 'OTP sent to your email.' });
  } catch (error) {
    logger.error('Signup OTP request error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send OTP', error: error.message });
  }
};

exports.signupVerifyOtp = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.signupOTP || !user.signupOTPExpiry) {
      return res.status(400).json({ status: 'error', message: 'No OTP requested for this email.' });
    }

    if (user.signupOTPExpiry < new Date()) {
      return res.status(400).json({ status: 'error', message: 'OTP expired. Please request a new one.' });
    }

    if (user.signupOTP !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.name = name;
    user.passwordHash = passwordHash;
    user.signupOTP = undefined;
    user.signupOTPExpiry = undefined;
    
    await user.save();

    sendWelcomeEmail(email, { name, email, password }).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    const token = generateToken(user._id);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        token
      }
    });
  } catch (error) {
    logger.error('Signup verification error:', error);
    res.status(500).json({ status: 'error', message: 'Signup failed', error: error.message });
  }
};
exports.send2FAOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); 
    user.twoFAOTP = otp;
    user.twoFAOTPExpiry = expiry;
    await user.save();
    await send2FAOtpEmail(user.email, { name: user.name, otp });
    res.json({ status: 'success', message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to send OTP', error: error.message });
  }
};

exports.verify2FAOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if (!user.twoFAOTP || !user.twoFAOTPExpiry || user.twoFAOTPExpiry < new Date()) {
      return res.status(400).json({ status: 'error', message: 'OTP expired or not requested' });
    }
    if (user.twoFAOTP !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP' });
    }
    user.is2FAEnabled = true;
    user.twoFAOTP = undefined;
    user.twoFAOTPExpiry = undefined;
    await user.save();
    res.json({ status: 'success', message: 'Two-factor authentication enabled.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to verify OTP', error: error.message });
  }
};

exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', is2FAEnabled: !!user.is2FAEnabled });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get 2FA status', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const plainPassword = password;
    const user = await User.create({
      name,
      email,
      passwordHash
    });
    sendWelcomeEmail(email, {
      name,
      email,
      password: plainPassword
    }).catch(error => {
      logger.error('Failed to send welcome email:', error);
    });
    const token = generateToken(user._id);
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating user',
      error: error.message
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found for email ${email}`);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (!user.passwordHash) {
      logger.warn(`Login failed: User ${email} has no passwordHash (possibly OTP signup incomplete)`);
      return res.status(401).json({
        status: 'error',
        message: 'Account not fully setup. Please complete signup or reset password.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      logger.warn(`Login failed: Incorrect password for email ${email}`);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (user.is2FAEnabled) {
      logger.info(`2FA required for user ${email}`);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); 
      user.twoFAOTP = otp;
      user.twoFAOTPExpiry = expiry;
      await user.save();
      await send2FAOtpEmail(user.email, { name: user.name, otp });
      return res.status(200).json({
        status: 'require-2fa',
        message: '2FA enabled. OTP sent to email.',
        data: { user: { id: user._id, name: user.name, email: user.email } }
      });
    }

    logger.info(`Login successful for user ${email}`);
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging in',
      error: error.message
    });
  }
};
exports.login2FAVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    if (!user.is2FAEnabled) return res.status(400).json({ status: 'error', message: '2FA not enabled for this user' });
    if (!user.twoFAOTP || !user.twoFAOTPExpiry || user.twoFAOTPExpiry < new Date()) {
      return res.status(400).json({ status: 'error', message: 'OTP expired or not requested' });
    }
    if (user.twoFAOTP !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP' });
    }
    user.twoFAOTP = undefined;
    user.twoFAOTPExpiry = undefined;
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '2FA verification failed', error: error.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile',
      error: error.message
    });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    if (!user.passwordHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot change password for Google OAuth accounts'
      });
    }
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = newPasswordHash;
    await user.save();
    (async () => {
      try {
        if (user.emailNotificationsEnabled !== false) {
          const result = await sendPasswordChanged(user.email, { name: user.name || '', newPassword });
          if (!result.ok) {
            console.error('Failed to send password-changed email for user:', user.email, 'error:', result.error);
          }
        }
      } catch (err) {
        console.error('Error while sending password-changed email:', err);
      }
    })();
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error changing password',
      error: error.message
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio, budgetAlertEnabled, emailNotificationsEnabled } = req.body;
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;  
    if (location !== undefined) updateData.location = location || null;  
    if (bio !== undefined) updateData.bio = bio || null;  
    if (budgetAlertEnabled !== undefined) updateData.budgetAlertEnabled = budgetAlertEnabled;
    if (emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = emailNotificationsEnabled;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      error: error.message
    });
  }
};
