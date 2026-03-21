const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');
const getDateRange = (period = 'month') => {
  const now = new Date();
  const from = new Date(now);
  switch (period.toLowerCase()) {
    case 'week':
      from.setDate(now.getDate() - 7);
      break;
    case 'year':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case 'month':
    default:
      from.setMonth(now.getMonth() - 1);
  }
  return { from, to: now };
};
const getSpendingTrends = async (userId, period = 'month') => {
  const { from, to } = getDateRange(period);
  const trends = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'Expense',
        date: { $gte: from, $lte: to }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  return trends;
};
const getCategorySpending = async (userId, period = 'month') => {
  const { from, to } = getDateRange(period);
  const categories = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'Expense',
        date: { $gte: from, $lte: to }
      }
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
  return categories;
};
const getRecurringAnalysis = async (userId, period = 'month') => {
  const { from, to } = getDateRange(period);
  const analysis = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'Expense',
        date: { $gte: from, $lte: to }
      }
    },
    {
      $group: {
        _id: "$isRecurring",
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);
  return {
    recurring: analysis.find(a => a._id === true) || { total: 0, count: 0 },
    oneTime: analysis.find(a => a._id === false) || { total: 0, count: 0 }
  };
};
const getFinancialInsights = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    const [trends, categories, recurringAnalysis] = await Promise.all([
      getSpendingTrends(userId, period),
      getCategorySpending(userId, period),
      getRecurringAnalysis(userId, period)
    ]);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.total, 0);
    const topCategories = categories.slice(0, 3).map(cat => ({
      category: cat._id,
      amount: cat.total,
      percentage: Math.round((cat.total / totalSpent) * 100)
    }));
    const income = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'Income',
          date: { $gte: getDateRange(period).from, $lte: getDateRange(period).to }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    const totalIncome = income[0]?.total || 0;
    const savingsRate = totalIncome > 0
      ? Math.max(0, ((totalIncome - totalSpent) / totalIncome) * 100).toFixed(1)
      : 0;
    res.json({
      status: 'success',
      data: {
        period: {
          from: getDateRange(period).from,
          to: getDateRange(period).to
        },
        summary: {
          totalSpent,
          totalIncome,
          savingsRate: Number(savingsRate),
          totalTransactions: trends.reduce((sum, t) => sum + t.count, 0)
        },
        trends,
        categories: categories.map(c => ({
          name: c._id,
          amount: c.total,
          percentage: Math.round((c.total / totalSpent) * 100) || 0,
          count: c.count
        })),
        topCategories,
        recurringAnalysis: {
          recurringAmount: recurringAnalysis.recurring.total || 0,
          recurringCount: recurringAnalysis.recurring.count || 0,
          oneTimeAmount: recurringAnalysis.oneTime.total || 0,
          oneTimeCount: recurringAnalysis.oneTime.count || 0
        },
        recommendations: generateRecommendations({
          categories,
          totalSpent,
          totalIncome,
          recurringAnalysis
        })
      }
    });
  } catch (error) {
    console.error('Error getting financial insights:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching financial insights',
      error: error.message
    });
  }
};
const generateRecommendations = (data) => {
  const { categories, totalSpent, totalIncome, recurringAnalysis } = data;
  const recommendations = [];
  if (totalSpent > totalIncome * 0.8) {
    recommendations.push({
      type: 'warning',
      title: 'High Spending Alert',
      message: 'Your spending is over 80% of your income. Consider reviewing your expenses.'
    });
  }
  categories.slice(0, 3).forEach(cat => {
    if (cat.total > totalSpent * 0.3) { 
      recommendations.push({
        type: 'info',
        title: 'High Spending Category',
        message: `You're spending a significant portion (${Math.round((cat.total / totalSpent) * 100)}%) on ${cat._id}. Consider if this aligns with your priorities.`
      });
    }
  });
  if (recurringAnalysis.recurringAmount > totalIncome * 0.5) {
    recommendations.push({
      type: 'warning',
      title: 'High Fixed Expenses',
      message: 'Your recurring expenses are more than 50% of your income. This may limit your financial flexibility.'
    });
  }
  if (totalSpent < totalIncome * 0.7) {
    recommendations.push({
      type: 'success',
      title: 'Good Savings Rate',
      message: `You're saving about ${Math.round(100 - (totalSpent / totalIncome * 100))}% of your income. Great job!`
    });
  }
  return recommendations.length > 0 ? recommendations : [{
    type: 'info',
    title: 'Looking Good!',
    message: 'Your spending patterns look healthy. Keep up the good work!'
  }];
};
const getGoalsProgress = async (req, res) => {
  try {
    const goals = [
      {
        id: 1,
        name: 'Emergency Fund',
        target: 100000,
        current: 25000,
        deadline: '2024-12-31',
        onTrack: true
      },
      {
        id: 2,
        name: 'Vacation',
        target: 50000,
        current: 10000,
        deadline: '2024-06-30',
        onTrack: false
      }
    ];
    res.json({
      status: 'success',
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching goals progress',
      error: error.message
    });
  }
};
module.exports = {
  getFinancialInsights,
  getGoalsProgress
};
