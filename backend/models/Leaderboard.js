const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  lifetimePoints: {
    type: Number,
    default: 0
  },
  monthlyRank: {
    type: Number,
    default: null
  },
  lifetimeRank: {
    type: Number,
    default: null
  },
  savingsAmount: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastMonthlyReset: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
leaderboardSchema.index({ monthlyPoints: -1 });
leaderboardSchema.index({ lifetimePoints: -1 });
leaderboardSchema.index({ userId: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
