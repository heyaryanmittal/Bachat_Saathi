const mongoose = require('mongoose');

const recurringRuleSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  cadence: {
    type: String,
    enum: ['monthly', 'weekly'],
    required: true
  },
  nextRunAt: {
    type: Date,
    required: true
  },
  endsAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('RecurringRule', recurringRuleSchema);
