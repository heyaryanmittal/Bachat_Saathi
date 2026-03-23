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
      'budget_under_limit',      
      'goal_completed',          
      'goal_savings',            
      'debt_payment',            
      'debt_completed',
      'debt_paid_off',          
      'weekly_login_streak',
      'recurring_saving_streak',     
      'monthly_savings',
      'transaction_recorded',
      'points_earned',
      'manual_adjustment',
      'daily_bonus'
    ]
  },
  description: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false 
  },
  relatedModel: {
    type: String,
    enum: ['Budget', 'Goal', 'Debt', 'Transaction'],
    required: false
  }
}, {
  timestamps: true
});
pointsLogSchema.index({ userId: 1, createdAt: -1 });
pointsLogSchema.index({ reason: 1 });
module.exports = mongoose.model('PointsLog', pointsLogSchema);
