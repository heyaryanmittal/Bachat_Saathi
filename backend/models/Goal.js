const mongoose = require('mongoose');
const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  category: {
    type: String,
    enum: ['emergency', 'vacation', 'car', 'house', 'education', 'investment', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ deadline: 1 });
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.savedAmount / this.targetAmount) * 100, 100);
});
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});
goalSchema.virtual('isOverdue').get(function() {
  return this.deadline < new Date() && this.status === 'in-progress';
});
goalSchema.methods.addSavings = function(amount) {
  if (amount <= 0) {
    throw new Error('Savings amount must be positive');
  }
  this.savedAmount += amount;
  if (this.savedAmount >= this.targetAmount) {
    this.status = 'completed';
    this.savedAmount = this.targetAmount; 
  }
  return this.save();
};
goalSchema.methods.updateProgress = function(newSavedAmount) {
  if (newSavedAmount < 0) {
    throw new Error('Saved amount cannot be negative');
  }
  this.savedAmount = newSavedAmount;
  if (this.savedAmount >= this.targetAmount) {
    this.status = 'completed';
    this.savedAmount = this.targetAmount;
  } else if (this.savedAmount === 0) {
    this.status = 'in-progress';
  }
  return this.save();
};
module.exports = mongoose.model('Goal', goalSchema);
