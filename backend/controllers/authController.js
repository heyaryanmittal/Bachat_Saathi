const { sendSignupOtpEmail } = require('../utils/emailService');
// Request OTP for signup (step 1)
exports.signupRequestOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    // If user exists and has a passwordHash, they are fully registered
    if (existingUser && existingUser.passwordHash) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This email is already registered. Please login instead.' 
      });
    }
    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email format' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    // Save OTP and info in a temp user (not activated)
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, passwordHash: '', signupOTP: otp, signupOTPExpiry: expiry });
    } else {
      user.signupOTP = otp;
      user.signupOTPExpiry = expiry;
    }
    await user.save();
    // Try to send OTP email
    const emailResult = await sendSignupOtpEmail(email, { name, otp });
    if (!emailResult.ok) {
      return res.status(400).json({ status: 'error', message: 'Failed to send OTP. Please check your email address.' });
    }
    res.json({ status: 'success', message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP and complete signup (step 2)
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
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    user.name = name;
    user.passwordHash = passwordHash;
    user.signupOTP = undefined;
    user.signupOTPExpiry = undefined;
    await user.save();
    // Send welcome email (optional)
    sendWelcomeEmail(email, { name, email, password }).catch(() => {});
    // Generate JWT token
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
    res.status(500).json({ status: 'error', message: 'Signup failed', error: error.message });
  }
};
const { sendWelcomeEmail, send2FAOtpEmail, sendPasswordChanged } = require('../utils/emailService');
// Send 2FA OTP to user's email
exports.send2FAOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFAOTP = otp;
    user.twoFAOTPExpiry = expiry;
    await user.save();

    await send2FAOtpEmail(user.email, { name: user.name, otp });
    res.json({ status: 'success', message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to send OTP', error: error.message });
  }
};

// Verify 2FA OTP and enable 2FA
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

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', is2FAEnabled: !!user.is2FAEnabled });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get 2FA status', error: error.message });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
// const { sendWelcomeEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Store the plain password for the welcome email
    const plainPassword = password;
    
    // Create new user
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Send welcome email with credentials (don't await to avoid blocking the response)
    sendWelcomeEmail(email, {
      name,
      email,
      password: plainPassword
    }).catch(error => {
      logger.error('Failed to send welcome email:', error);
      // Don't fail the signup process if email sending fails
    });

    // Generate JWT token
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

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // If 2FA is enabled, send OTP and require verification
    if (user.is2FAEnabled) {
      // Generate OTP and expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
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

    // If 2FA not enabled, proceed as normal
    // Update lastLogin
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

// Verify 2FA OTP at login and return JWT
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
    // OTP valid, clear OTP fields and return JWT
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

// Get user profile
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

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    // Get user with password hash
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user has a password (for Google OAuth users)
    if (!user.passwordHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot change password for Google OAuth accounts'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();

    // Send a password-changed notification email (do not block response)
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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio, budgetAlertEnabled, emailNotificationsEnabled } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }
    }

    // Build update object - include all fields that are present in request
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;  // Allow null for empty values
    if (location !== undefined) updateData.location = location || null;  // Allow null for empty values
    if (bio !== undefined) updateData.bio = bio || null;  // Allow null for empty values
    if (budgetAlertEnabled !== undefined) updateData.budgetAlertEnabled = budgetAlertEnabled;
    if (emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = emailNotificationsEnabled;

    // Update user profile
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
