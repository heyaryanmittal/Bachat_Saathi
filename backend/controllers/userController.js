const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Debt = require('../models/Debt');
const mongoose = require('mongoose');
const LeaderboardService = require('../services/leaderboardService');

// ================================
// Get User Points
// ================================
exports.getUserPoints = async (req, res) => {
  try {
    // First get the user to ensure they exist
    const user = await User.findById(req.user.id).select('points');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Calculate total points from PointsLog
    const pointsLog = await PointsLog.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const totalPoints = pointsLog.length > 0 ? pointsLog[0].total : 0;

    // Update user's points in the User model for backward compatibility
    if (totalPoints !== user.points) {
      user.points = totalPoints;
      await user.save();
    }

    res.json({
      status: 'success',
      data: {
        points: totalPoints
      }
    });
  } catch (error) {
    console.error('Get user points error:', error);
    
    // Fallback to user.points if there's an error with the aggregation
    const user = await User.findById(req.user.id).select('points');
    
    res.json({
      status: 'success',
      data: {
        points: user?.points || 0
      }
    });
  }
};

// ================================
// Get Points History
// ================================
exports.getPointsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const pointsHistory = await PointsLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limitNum * 1)
      .skip((pageNum - 1) * limitNum);

    const total = await PointsLog.countDocuments({ userId: req.user.id });

    res.json({
      status: 'success',
      results: pointsHistory.length,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      data: pointsHistory
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch points history'
    });
  }
};

// ================================
// Award Points for Budget Management
// ================================
exports.awardBudgetPoints = async (userId, budgetId) => {
  try {
    const budget = await Budget.findById(budgetId);

    if (!budget || budget.userId.toString() !== userId.toString()) {
      return;
    }

    // Check if user stayed under budget this month
    const utilizationPercentage = (budget.spentAmount / budget.budgetedAmount) * 100;

    if (utilizationPercentage < 100) {
      const pointsEarned = 50;

      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });

      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason: 'budget_under_limit',
        description: `Earned ${pointsEarned} points for staying under budget in ${budget.category}`,
        relatedId: budgetId,
        relatedModel: 'Budget'
      });

      // Update leaderboard
      await LeaderboardService.updateUser(userId, pointsEarned, 'budget_under_limit');

      console.log(`Awarded ${pointsEarned} points to user ${userId} for budget management`);
    }
  } catch (error) {
    console.error('Award budget points error:', error);
  }
};

// ================================
// Award Points for Goal Completion
// ================================
exports.awardGoalCompletionPoints = async (userId, goalId) => {
  try {
    const goal = await Goal.findById(goalId);

    if (!goal || goal.userId.toString() !== userId.toString()) {
      return;
    }

    if (goal.status === 'completed') {
      const pointsEarned = 100;

      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });

      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason: 'goal_completed',
        description: `Earned ${pointsEarned} bonus points for completing goal: ${goal.title}`,
        relatedId: goalId,
        relatedModel: 'Goal'
      });

      // Update leaderboard
      await LeaderboardService.updateUser(userId, pointsEarned, 'goal_completed');

      console.log(`Awarded ${pointsEarned} points to user ${userId} for goal completion`);
    }
  } catch (error) {
    console.error('Award goal completion points error:', error);
  }
};


// ================================
// Award Points for Monthly Savings
// ================================
/**
 * Calculate and award points for monthly savings (income - expenses)
 * @param {string} userId - User ID
 * @param {Date} date - Reference date for the month to calculate savings
 */
exports.awardMonthlySavingsPoints = async (userId, date = new Date()) => {
  try {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    // Get all income transactions for the month
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: 'income',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get all expense transactions for the month
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const savings = totalIncome - totalExpenses;

    // Award 5 points per 1000 INR saved (minimum 1 point for any savings)
    if (savings > 0) {
      const pointsEarned = Math.max(1, Math.floor(savings / 1000) * 5);
      
      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });

      const monthYear = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason: 'monthly_savings',
        description: `Earned ${pointsEarned} points for saving ₹${savings} in ${monthYear}`,
        relatedModel: 'Transaction'
      });

      // Update leaderboard
      await LeaderboardService.updateUser(userId, pointsEarned, 'monthly_savings');

      console.log(`Awarded ${pointsEarned} points to user ${userId} for monthly savings`);
      return { success: true, pointsEarned, savings };
    }

    return { success: true, pointsEarned: 0, savings };
  } catch (error) {
    console.error('Award monthly savings points error:', error);
    return { success: false, error: error.message };
  }
};

// ================================
// Award Points for Debt Payment
// ================================
exports.awardDebtPaymentPoints = async (userId, debtId, paymentAmount) => {
  try {
    const debt = await Debt.findById(debtId);

    if (!debt || debt.userId.toString() !== userId.toString()) {
      return;
    }

    // Award points based on payment amount (10 points per 1000 INR)
    const pointsEarned = Math.floor(paymentAmount / 1000) * 10;

    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });

      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason: 'debt_paid_off',
        description: `Earned ${pointsEarned} points for paying off debt: ${debt.title}`,
        relatedId: debtId,
        relatedModel: 'Debt'
      });

      // Update leaderboard
      await LeaderboardService.updateUser(userId, pointsEarned, 'debt_paid_off');

      console.log(`Awarded ${pointsEarned} points to user ${userId} for debt payment`);
    }
  } catch (error) {
    console.error('Award debt payment points error:', error);
  }
};

// ================================
// Get User Achievements
// ================================
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const achievements = {
      budgetMaster: {
        title: 'Budget Master',
        description: 'Stay under budget for 3 consecutive months',
        icon: '🎯',
        earned: false
      },
      goalCrusher: {
        title: 'Goal Crusher',
        description: 'Complete 5 saving goals',
        icon: '🏆',
        earned: false
      },
      debtDestroyer: {
        title: 'Debt Destroyer',
        description: 'Pay off 3 debts completely',
        icon: '💪',
        earned: false
      },
      consistentSaver: {
        title: 'Consistent Saver',
        description: 'Maintain saving streak for 6 months',
        icon: '📈',
        earned: false
      },
      financialGuru: {
        title: 'Financial Guru',
        description: 'Reach 1000 total points',
        icon: '🧠',
        earned: false
      }
    };

    // Check Budget Master
    const user = await User.findById(userId);
    const now = new Date();
    
    if (user.firstBudgetDate) {
      // Check if it's been at least 3 months since first budget
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2); // 2 months back to get 3 months total
      threeMonthsAgo.setDate(1); // Start of the month
      
      if (user.firstBudgetDate <= threeMonthsAgo) {
        // Get all compliance months and sort them
        const complianceMonths = [...user.budgetComplianceMonths].sort((a, b) => a - b);
        
        // Check for 3 consecutive months
        let consecutiveCount = 0;
        for (let i = 0; i < complianceMonths.length - 1; i++) {
          const current = complianceMonths[i];
          const next = complianceMonths[i + 1];
          
          // Check if next month is one month after current
          const expectedNextMonth = new Date(current);
          expectedNextMonth.setMonth(expectedNextMonth.getMonth() + 1);
          
          if (
            next.getMonth() === expectedNextMonth.getMonth() && 
            next.getFullYear() === expectedNextMonth.getFullYear()
          ) {
            consecutiveCount++;
            if (consecutiveCount >= 2) { // 2 gaps means 3 consecutive months
              break;
            }
          } else {
            consecutiveCount = 0;
          }
        }
        
        achievements.budgetMaster.earned = consecutiveCount >= 2; // 2 gaps = 3 months
      }
    }

    // Check Goal Crusher
    const completedGoals = await Goal.find({
      userId,
      status: 'completed'
    }).countDocuments();

    achievements.goalCrusher.earned = completedGoals >= 5;

    // Check Debt Destroyer
    // Get all closed debts
    const closedDebts = await Debt.find({
      userId,
      status: 'closed'
    });
    
    // Calculate total amount cleared from closed debts
    const totalDebtCleared = closedDebts.reduce((total, debt) => {
      return total + (debt.amount || 0);
    }, 0);
    
    // Award badge if either:
    // 1. User has closed 5 or more debts, OR
    // 2. User has cleared more than 1 crore (10,000,000) in total debt
    achievements.debtDestroyer.earned = closedDebts.length >= 5 || totalDebtCleared >= 10000000;
    
    // Update the description based on which condition was met
    if (achievements.debtDestroyer.earned) {
      if (closedDebts.length >= 5) {
        achievements.debtDestroyer.description = `Earned for paying off ${closedDebts.length} debts`;
      } else {
        achievements.debtDestroyer.description = `Earned for clearing ₹${(totalDebtCleared / 100000).toFixed(2)}L in total debt`;
      }
    }

    // Check Consistent Saver
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentSavingLogs = await PointsLog.find({
      userId,
      reason: 'recurring_saving_streak',
      createdAt: { $gte: sixMonthsAgo }
    }).countDocuments();

    achievements.consistentSaver.earned = recentSavingLogs >= 6;

    // Check Financial Guru
    achievements.financialGuru.earned = user.points >= 1000;

    res.json({
      status: 'success',
      data: achievements
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user achievements'
    });
  }
};

// ================================
// Admin: Get All Users Points (Future Admin Feature)
// ================================
exports.getAllUsersPoints = async (req, res) => {
  try {
    // This would be for admin users only
    const users = await User.find({})
      .select('name email points createdAt')
      .sort({ points: -1 });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Get all users points error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users points'
    });
  }
};

// ================================
// Get User Usage Statistics
// ================================
exports.getUserUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count total transactions
    const totalTransactions = await Transaction.countDocuments({ userId });

    // Count active budgets
    const totalBudgets = await Budget.countDocuments({ userId });

    // Count active debts (not paid off)
    const totalDebts = await Debt.countDocuments({ 
      userId, 
      status: { $ne: 'paid' } 
    });

    // Count active goals (not completed)
    const totalGoals = await Goal.countDocuments({ 
      userId, 
      status: { $ne: 'completed' } 
    });

    // Count total wallets
    const Wallet = mongoose.model('Wallet');
    const totalWallets = await Wallet.countDocuments({ userId });

    // Get user creation date to calculate days active
    const user = await User.findById(userId).select('createdAt lastLogin');
    const daysActive = user ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

    // Get last login date
    const lastLoginDate = user?.lastLogin ? new Date(user.lastLogin) : new Date(user?.createdAt);

    res.json({
      status: 'success',
      data: {
        totalTransactions,
        totalBudgets,
        totalDebts,
        totalGoals,
        totalWallets,
        daysActive,
        lastLogin: lastLoginDate,
        joinedDate: user?.createdAt
      }
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch usage statistics'
    });
  }
};
