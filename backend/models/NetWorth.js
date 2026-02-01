const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Cash', 'Bank Accounts', 'Investments', 'Real Estate', 'Vehicles', 'Personal Property', 'Other'],
    default: 'Other'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

const liabilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Credit Cards', 'Loans', 'Mortgages', 'Student Loans', 'Personal Loans', 'Other'],
    default: 'Other'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

const netWorthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  assets: [assetSchema],
  liabilities: [liabilitySchema],
  totalAssets: {
    type: Number,
    default: 0,
    min: 0
  },
  totalLiabilities: {
    type: Number,
    default: 0,
    min: 0
  },
  netWorth: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ================================
// Virtual for calculating net worth
// ================================
netWorthSchema.virtual('calculatedNetWorth').get(function() {
  return this.totalAssets - this.totalLiabilities;
});

// ================================
// Pre-save middleware to calculate totals
// ================================
netWorthSchema.pre('save', function(next) {
  this.totalAssets = this.assets.reduce((sum, asset) => sum + asset.value, 0);
  this.totalLiabilities = this.liabilities.reduce((sum, liability) => sum + liability.value, 0);
  this.netWorth = this.totalAssets - this.totalLiabilities;
  next();
});

// ================================
// Instance method to add asset
// ================================
netWorthSchema.methods.addAsset = function(assetData) {
  this.assets.push(assetData);
  return this.save();
};

// ================================
// Instance method to add liability
// ================================
netWorthSchema.methods.addLiability = function(liabilityData) {
  this.liabilities.push(liabilityData);
  return this.save();
};

// ================================
// Static method to get net worth history
// ================================
netWorthSchema.statics.getNetWorthHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ date: -1 })
    .limit(limit);
};

// ================================
// Static method to calculate current net worth
// ================================
netWorthSchema.statics.calculateCurrentNetWorth = function(userId) {
  return this.findOne({ userId })
    .sort({ date: -1 });
};

// ================================
// Database Indexes for Performance
// ================================
netWorthSchema.index({ userId: 1, date: -1 });
netWorthSchema.index({ userId: 1 });

module.exports = mongoose.model('NetWorth', netWorthSchema);
