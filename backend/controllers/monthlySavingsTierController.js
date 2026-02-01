const MonthlySavingsTier = require('../models/MonthlySavingsTier');
const User = require('../models/User');
const { calculateMonthlySavingsTier, getCurrentMonthTier, getMonthlyTiersHistory, updateCurrentMonthTier } = require('../utils/monthlySavingsCalculator');

// ================================
// Get Current Month Tier
// ================================
exports.getCurrentMonthTier = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTier = await getCurrentMonthTier(userId);

    if (!currentTier) {
      // Calculate current month tier if not exists
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

// ================================
// Get Monthly Tiers History
// ================================
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

// ================================
// Calculate and Update Current Month Tier
// ================================
exports.calculateCurrentMonthTier = async (req, res) => {
  try {
    const userId = req.user.id;

    // Recalculate current month tier
    const updatedTier = await updateCurrentMonthTier(userId);

    // Award points to user
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

// ================================
// Get Tier Statistics
// ================================
exports.getTierStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current tier
    const currentTier = await getCurrentMonthTier(userId);

    // Get tier history for stats
    const history = await getMonthlyTiersHistory(userId, 12);

    // Calculate statistics
    const tierCounts = {};
    let totalPointsEarned = 0;

    history.forEach(tier => {
      tierCounts[tier.tier] = (tierCounts[tier.tier] || 0) + 1;
      totalPointsEarned += tier.pointsEarned;
    });

    // Get highest tier achieved
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

// ================================
// Get All Users Monthly Tiers (Admin)
// ================================
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
