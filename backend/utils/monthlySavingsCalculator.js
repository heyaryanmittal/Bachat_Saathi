const Transaction = require('../models/Transaction');

/**
 * Calculate monthly savings tier based on income and expenses
 */
const calculateMonthlySavingsTier = async (userId, year, month) => {
  try {
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // month is 1-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

    // Aggregate transactions for the month
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    monthlyStats.forEach(stat => {
      if (stat._id === 'Income') {
        totalIncome = stat.total;
      } else if (stat._id === 'Expense') {
        totalExpenses = stat.total;
      }
    });

    const netSavings = totalIncome - totalExpenses;

    // Determine tier based on savings amount
    let tier, pointsEarned, badgeIcon, badgeColor;

    if (netSavings <= 20000) {
      tier = 'bronze';
      pointsEarned = 100;
      badgeIcon = '🥉';
      badgeColor = 'from-amber-600 to-amber-800';
    } else if (netSavings <= 50000) {
      tier = 'silver';
      pointsEarned = 250;
      badgeIcon = '🥈';
      badgeColor = 'from-slate-400 to-slate-600';
    } else if (netSavings <= 100000) {
      tier = 'gold';
      pointsEarned = 500;
      badgeIcon = '🥇';
      badgeColor = 'from-yellow-400 to-yellow-600';
    } else if (netSavings <= 300000) {
      tier = 'diamond';
      pointsEarned = 1000;
      badgeIcon = '💎';
      badgeColor = 'from-blue-400 to-blue-600';
    } else if (netSavings <= 500000) {
      tier = 'platinum';
      pointsEarned = 2000;
      badgeIcon = '🪶';
      badgeColor = 'from-slate-300 to-slate-500';
    } else {
      tier = 'king';
      pointsEarned = 5000;
      badgeIcon = '👑';
      badgeColor = 'from-purple-400 to-purple-600';
    }

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      tier,
      pointsEarned,
      badgeIcon,
      badgeColor,
      calculatedAt: new Date()
    };

  } catch (error) {
    console.error('Error calculating monthly savings tier:', error);
    throw error;
  }
};

/**
 * Get or create monthly savings tier for a specific month
 */
const getOrCreateMonthlyTier = async (userId, year, month) => {
  const MonthlySavingsTier = require('../models/MonthlySavingsTier');

  // Check if tier already exists for this month
  let monthlyTier = await MonthlySavingsTier.findOne({
    userId,
    year,
    month: `${year}-${month.toString().padStart(2, '0')}`
  });

  if (monthlyTier) {
    return monthlyTier;
  }

  // Calculate new tier
  const tierData = await calculateMonthlySavingsTier(userId, year, month);

  // Create new monthly tier record
  monthlyTier = await MonthlySavingsTier.create({
    userId,
    month: `${year}-${month.toString().padStart(2, '0')}`,
    year,
    totalIncome: tierData.totalIncome,
    totalExpenses: tierData.totalExpenses,
    netSavings: tierData.netSavings,
    tier: tierData.tier,
    pointsEarned: tierData.pointsEarned,
    badgeIcon: tierData.badgeIcon,
    badgeColor: tierData.badgeColor,
    isCurrentMonth: true // Mark as current month
  });

  return monthlyTier;
};

/**
 * Get current month's tier for user
 */
const getCurrentMonthTier = async (userId) => {
  const MonthlySavingsTier = require('../models/MonthlySavingsTier');
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

  return await MonthlySavingsTier.findOne({
    userId,
    month: currentMonth,
    isCurrentMonth: true
  }).sort({ calculatedAt: -1 });
};

/**
 * Get all monthly tiers for user (for history)
 */
const getMonthlyTiersHistory = async (userId, limit = 12) => {
  const MonthlySavingsTier = require('../models/MonthlySavingsTier');

  return await MonthlySavingsTier.find({ userId })
    .sort({ year: -1, month: -1 })
    .limit(limit);
};

/**
 * Update current month tier (recalculate if needed)
 */
const updateCurrentMonthTier = async (userId) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return await getOrCreateMonthlyTier(userId, currentYear, currentMonth);
};

module.exports = {
  calculateMonthlySavingsTier,
  getOrCreateMonthlyTier,
  getCurrentMonthTier,
  getMonthlyTiersHistory,
  updateCurrentMonthTier
};
