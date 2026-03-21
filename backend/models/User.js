const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: false 
  },
  phone: {
    type: String,
    default: null,
    trim: true
  },
  location: {
    type: String,
    default: null,
    trim: true
  },
  bio: {
    type: String,
    default: null,
    trim: true
  },
  signupOTP: String,
  signupOTPExpiry: Date,
  is2FAEnabled: {
    type: Boolean,
    default: false
  },
  twoFAType: {
    type: String,
    enum: ['email'],
    default: 'email'
  },
  twoFAOTP: String,
  twoFAOTPExpiry: Date,
  budgetAlertEnabled: {
    type: Boolean,
    default: true
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
