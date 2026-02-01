const mongoose = require('mongoose');

const pointsLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  points: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'budget_under_limit',      // 50 points for staying under budget
      'goal_completed',          // 100 points for completing a goal
      'goal_savings',            // 5 points per ₹1,000 saved
      'debt_payment',            // 10 points per ₹1,000 paid
      'debt_completed',          // 1000 points for completing a debt
      'weekly_login_streak',     // Points for weekly login streak
      'monthly_savings'          // 5 points per ₹1,000 saved (monthly income - expenses)
    ]
  },
  description: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Reference to related object (budget, goal, etc.)
  },
  relatedModel: {
    type: String,
    enum: ['Budget', 'Goal', 'Debt', 'Transaction'],
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
pointsLogSchema.index({ userId: 1, createdAt: -1 });
pointsLogSchema.index({ reason: 1 });

module.exports = mongoose.model('PointsLog', pointsLogSchema);
