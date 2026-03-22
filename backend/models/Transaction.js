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
  toWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
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
      return this.type !== 'Transfer'; 
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
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, walletId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ 
  userId: 1, 
  type: 1, 
  category: 1, 
  date: -1 
});
module.exports = mongoose.model('Transaction', transactionSchema);
