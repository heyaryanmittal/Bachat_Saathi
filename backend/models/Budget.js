const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  alertThreshold: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  }
  ,
  alert80Sent: {
    type: Boolean,
    default: false
  },
  alert100Sent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ===============================
// Database Indexes for Performance
// ===============================
// Index for user-specific budget queries
budgetSchema.index({ userId: 1, month: 1, year: 1 });

// Index for category-based budget queries
budgetSchema.index({ userId: 1, category: 1 });

// Static method to check if user stayed within budget for a month
budgetSchema.statics.checkMonthlyCompliance = async function(userId, year, month) {
  const budgets = await this.find({
    userId,
    year,
    month,
    $expr: { $gt: ['$spent', '$amount'] } // Find budgets where spent > amount
  });
  
  return budgets.length === 0; // Return true if all budgets are within limit
};

// Middleware to update user's firstBudgetDate and check compliance
budgetSchema.pre('save', async function(next) {
  try {
    // Update firstBudgetDate if not set
    const user = await mongoose.model('User').findById(this.userId);
    if (!user.firstBudgetDate) {
      user.firstBudgetDate = new Date();
      await user.save();
    }
    
    // Check if this is a new budget for the current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (this.year === currentYear && this.month === currentMonth) {
      const isCompliant = await this.constructor.checkMonthlyCompliance(this.userId, currentYear, currentMonth);
      
      if (isCompliant) {
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        
        // Add to compliance months if not already added
        if (!user.budgetComplianceMonths.some(d => 
          d.getMonth() === monthStart.getMonth() && 
          d.getFullYear() === monthStart.getFullYear()
        )) {
          user.budgetComplianceMonths.push(monthStart);
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Error in budget pre-save hook:', error);
  }
  
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
