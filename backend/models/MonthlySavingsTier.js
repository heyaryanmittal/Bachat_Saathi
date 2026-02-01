const mongoose = require('mongoose');

const monthlySavingsTierSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true, // Format: "YYYY-MM"
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  totalIncome: {
    type: Number,
    required: true,
    default: 0
  },
  totalExpenses: {
    type: Number,
    required: true,
    default: 0
  },
  netSavings: {
    type: Number,
    required: true,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'diamond', 'platinum', 'king'],
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 0
  },
  badgeIcon: {
    type: String,
    required: true
  },
  badgeColor: {
    type: String,
    required: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  isCurrentMonth: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for unique user-month combination
monthlySavingsTierSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Index for efficient queries by tier and date
monthlySavingsTierSchema.index({ tier: 1, calculatedAt: -1 });

module.exports = mongoose.model('MonthlySavingsTier', monthlySavingsTierSchema);
