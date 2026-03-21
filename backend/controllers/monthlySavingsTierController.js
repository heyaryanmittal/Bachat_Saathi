const MonthlySavingsTier = require('../models/MonthlySavingsTier');
const User = require('../models/User');
const { calculateMonthlySavingsTier, getCurrentMonthTier, getMonthlyTiersHistory, updateCurrentMonthTier } = require('../utils/monthlySavingsCalculator');
exports.getCurrentMonthTier = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTier = await getCurrentMonthTier(userId);
    if (!currentTier) {
      const updatedTier = await updateCurrentMonthTier(userId);
      return res.json({
        status: 'success',
        data: updatedTier
      });
    }
    res.json({
      status: 'success',
      data: currentTier
    });
  } catch (error) {
    console.error('Get current month tier error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch current month tier'
    });
  }
};
exports.getMonthlyTiersHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 12 } = req.query;
    const history = await getMonthlyTiersHistory(userId, parseInt(limit));
    res.json({
      status: 'success',
      results: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get monthly tiers history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch monthly tiers history'
    });
  }
};
exports.calculateCurrentMonthTier = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedTier = await updateCurrentMonthTier(userId);
    await User.findByIdAndUpdate(userId, {
      $inc: { points: updatedTier.pointsEarned }
    });
    res.json({
      status: 'success',
      message: `Monthly tier calculated! Earned ${updatedTier.pointsEarned} points.`,
      data: updatedTier
    });
  } catch (error) {
    console.error('Calculate current month tier error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate monthly tier'
    });
  }
};
exports.getTierStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTier = await getCurrentMonthTier(userId);
    const history = await getMonthlyTiersHistory(userId, 12);
    const tierCounts = {};
    let totalPointsEarned = 0;
    history.forEach(tier => {
      tierCounts[tier.tier] = (tierCounts[tier.tier] || 0) + 1;
      totalPointsEarned += tier.pointsEarned;
    });
    const tierOrder = ['bronze', 'silver', 'gold', 'diamond', 'platinum', 'king'];
    const highestTier = history.reduce((highest, current) => {
      const currentIndex = tierOrder.indexOf(current.tier);
      const highestIndex = tierOrder.indexOf(highest);
      return currentIndex > highestIndex ? current.tier : highest;
    }, 'bronze');
    res.json({
      status: 'success',
      data: {
        currentTier,
        statistics: {
          totalMonthsTracked: history.length,
          tierDistribution: tierCounts,
          totalPointsEarned,
          highestTierAchieved: highestTier,
          averageMonthlySavings: history.length > 0
            ? history.reduce((sum, tier) => sum + tier.netSavings, 0) / history.length
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get tier statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tier statistics'
    });
  }
};
exports.getAllUsersMonthlyTiers = async (req, res) => {
  try {
    const { month, year, tier } = req.query;
    let query = {};
    if (month && year) {
      query.month = `${year}-${month.toString().padStart(2, '0')}`;
    }
    if (tier) {
      query.tier = tier;
    }
    const tiers = await MonthlySavingsTier.find(query)
      .populate('userId', 'name email')
      .sort({ calculatedAt: -1 });
    res.json({
      status: 'success',
      results: tiers.length,
      data: tiers
    });
  } catch (error) {
    console.error('Get all users monthly tiers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users monthly tiers'
    });
  }
};
