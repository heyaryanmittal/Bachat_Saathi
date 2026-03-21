const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Cash', 'Bank', 'Card', 'Other'],
    default: 'Cash'
  },
  openingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
walletSchema.index({ userId: 1 });
walletSchema.index({ userId: 1, type: 1 });
module.exports = mongoose.model('Wallet', walletSchema);
