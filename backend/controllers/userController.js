const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Debt = require('../models/Debt');
const mongoose = require('mongoose');
const LeaderboardService = require('../services/leaderboardService');
exports.getUserPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    const pointsLog = await PointsLog.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(user._id) } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    const totalPoints = pointsLog.length > 0 ? pointsLog[0].total : 0;
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
    const user = await User.findById(req.user.id).select('points');
    res.json({
      status: 'success',
      data: {
        points: user?.points || 0
      }
    });
  }
};
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
exports.awardBudgetPoints = async (userId, budgetId) => {
  try {
    const budget = await Budget.findById(budgetId);
    if (!budget || budget.userId.toString() !== userId.toString()) {
      return;
    }
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
      await LeaderboardService.updateUser(userId, pointsEarned, 'budget_under_limit');
      console.log(`Awarded ${pointsEarned} points to user ${userId} for budget management`);
    }
  } catch (error) {
    console.error('Award budget points error:', error);
  }
};
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
      await LeaderboardService.updateUser(userId, pointsEarned, 'goal_completed');
      console.log(`Awarded ${pointsEarned} points to user ${userId} for goal completion`);
    }
  } catch (error) {
    console.error('Award goal completion points error:', error);
  }
};
exports.awardMonthlySavingsPoints = async (userId, date = new Date()) => {
  try {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(userId),
          type: 'Income',
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
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(userId),
          type: 'Expense',
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
    if (savings > 0) {
      const pointsEarned = Math.floor(savings / 1000) * 5;
      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
      const monthYear = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason: 'monthly_savings',
        description: `Earned ${pointsEarned} points for saving ₹${savings} in ${monthYear}`,
        relatedModel: 'Transaction'
      });
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
exports.awardDebtPaymentPoints = async (userId, debtId, paymentAmount) => {
  try {
    const debt = await Debt.findById(debtId);
    if (!debt || debt.userId.toString() !== userId.toString()) {
      return;
    }
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
      await LeaderboardService.updateUser(userId, pointsEarned, 'debt_paid_off');
      console.log(`Awarded ${pointsEarned} points to user ${userId} for debt payment`);
    }
  } catch (error) {
    console.error('Award debt payment points error:', error);
  }
};
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
        description: 'Reach 15000 total points',
        icon: '🧠',
        earned: false
      }
    };
    const user = await User.findById(userId);
    const now = new Date();
    if (user.firstBudgetDate) {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2); 
      threeMonthsAgo.setDate(1); 
      if (user.firstBudgetDate <= threeMonthsAgo) {
        const complianceMonths = [...user.budgetComplianceMonths].sort((a, b) => a - b);
        let consecutiveCount = 0;
        for (let i = 0; i < complianceMonths.length - 1; i++) {
          const current = complianceMonths[i];
          const next = complianceMonths[i + 1];
          const expectedNextMonth = new Date(current);
          expectedNextMonth.setMonth(expectedNextMonth.getMonth() + 1);
          if (
            next.getMonth() === expectedNextMonth.getMonth() && 
            next.getFullYear() === expectedNextMonth.getFullYear()
          ) {
            consecutiveCount++;
            if (consecutiveCount >= 2) { 
              break;
            }
          } else {
            consecutiveCount = 0;
          }
        }
        achievements.budgetMaster.earned = consecutiveCount >= 2; 
      }
    }
    const completedGoals = await Goal.find({
      userId,
      status: 'completed'
    }).countDocuments();
    achievements.goalCrusher.earned = completedGoals >= 5;
    const closedDebts = await Debt.find({
      userId,
      status: 'closed'
    });
    const totalDebtCleared = closedDebts.reduce((total, debt) => {
      return total + (debt.amount || 0);
    }, 0);
    achievements.debtDestroyer.earned = closedDebts.length >= 5 || totalDebtCleared >= 10000000;
    if (achievements.debtDestroyer.earned) {
      if (closedDebts.length >= 5) {
        achievements.debtDestroyer.description = `Earned for paying off ${closedDebts.length} debts`;
      } else {
        achievements.debtDestroyer.description = `Earned for clearing ₹${(totalDebtCleared / 100000).toFixed(2)}L in total debt`;
      }
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentSavingLogs = await PointsLog.find({
      userId,
      reason: 'recurring_saving_streak',
      createdAt: { $gte: sixMonthsAgo }
    }).countDocuments();
    achievements.consistentSaver.earned = recentSavingLogs >= 6;
    achievements.financialGuru.earned = user.points >= 15000;
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
exports.getAllUsersPoints = async (req, res) => {
  try {
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
exports.getUserUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalTransactions = await Transaction.countDocuments({ userId });
    const totalBudgets = await Budget.countDocuments({ userId });
    const totalDebts = await Debt.countDocuments({ 
      userId, 
      status: { $ne: 'paid' } 
    });
    const totalGoals = await Goal.countDocuments({ 
      userId, 
      status: { $ne: 'completed' } 
    });
    const Wallet = mongoose.model('Wallet');
    const totalWallets = await Wallet.countDocuments({ userId });
    const user = await User.findById(userId).select('createdAt lastLogin');
    const daysActive = user ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
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
