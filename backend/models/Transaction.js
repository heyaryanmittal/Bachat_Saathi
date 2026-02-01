const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['Income', 'Expense', 'Transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  category: {
    type: String,
    required: function() {
      return this.type !== 'Transfer'; // Only required for Income/Expense
    }
  },
  subcategory: {
    type: String
  },
  merchant: {
    type: String
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringRule'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ===============================
// Database Indexes for Performance
// ===============================
// Index for user-specific queries (most common)
transactionSchema.index({ userId: 1, date: -1 });

// Index for wallet-specific queries
transactionSchema.index({ userId: 1, walletId: 1, date: -1 });

// Index for category-based queries
transactionSchema.index({ userId: 1, category: 1, date: -1 });

// Index for type-based queries
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Compound index for complex filtering
transactionSchema.index({ 
  userId: 1, 
  type: 1, 
  category: 1, 
  date: -1 
});

module.exports = mongoose.model('Transaction', transactionSchema);
