const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['loan', 'creditCard', 'personal', 'business', 'education', 'vehicle', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    min: 0,
    max: 100
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  remainingAmount: {
    type: Number,
    min: 0,
    default: function() {
      return this.amount;
    }
  },
  interestHistory: [{
    amount: {
      type: Number,
      required: true
    },
    calculatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
debtSchema.index({ userId: 1, status: 1 });
debtSchema.index({ dueDate: 1 });

// Virtual for checking if debt is overdue
debtSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status === 'active';
});

// Method to calculate total interest paid
debtSchema.methods.getTotalInterest = function() {
  if (!this.interestHistory || this.interestHistory.length === 0) {
    return 0;
  }
  return this.interestHistory.reduce((total, interest) => total + interest.amount, 0);
};

// Method to update remaining amount
debtSchema.methods.updateRemainingAmount = function(paymentAmount) {
  if (paymentAmount > this.remainingAmount) {
    throw new Error('Payment amount cannot exceed remaining debt amount');
  }
  this.remainingAmount -= paymentAmount;
  if (this.remainingAmount <= 0) {
    this.status = 'closed';
    this.remainingAmount = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Debt', debtSchema);
