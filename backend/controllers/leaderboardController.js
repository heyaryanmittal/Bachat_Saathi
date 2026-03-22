const LeaderboardService = require('../services/leaderboardService');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await LeaderboardService.getMonthlyLeaderboard(limit);
    res.json({
      status: 'success',
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        monthlyPoints: entry.monthlyPoints,
        badges: entry.badges || []
      }))
    });
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch monthly leaderboard'
    });
  }
};
exports.getLifetimeLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await LeaderboardService.getLifetimeLeaderboard(limit);
    res.json({
      status: 'success',
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        lifetimePoints: entry.lifetimePoints,
        badges: entry.badges || []
      }))
    });
  } catch (error) {
    console.error('Get lifetime leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch lifetime leaderboard'
    });
  }
};
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    let stats = await LeaderboardService.getUserStats(userId);
    if (!stats) {
      const user = await User.findById(userId);
      stats = await LeaderboardService.initializeUser(userId, user.name);
    }
    res.json({
      status: 'success',
      data: {
        username: stats.username,
        monthlyRank: stats.monthlyRank || 0,
        monthlyPoints: stats.monthlyPoints,
        lifetimeRank: stats.lifetimeRank || 0,
        lifetimePoints: stats.lifetimePoints,
        badges: stats.badges || []
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user stats'
    });
  }
};
exports.getUserRankContext = async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.query.type || 'monthly';
    const range = parseInt(req.query.range) || 2;
    const context = await LeaderboardService.getUserRankContext(userId, type, range);
    if (!context) {
      return res.status(404).json({
        status: 'error',
        message: 'User rank context not found'
      });
    }
    res.json({
      status: 'success',
      data: context
    });
  } catch (error) {
    console.error('Get user rank context error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user rank context'
    });
  }
};
exports.getFullLeaderboard = async (req, res) => {
  try {
    const type = req.query.type || 'monthly';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const pointsField = type === 'monthly' ? 'monthlyPoints' : 'lifetimePoints';
    const rankField = type === 'monthly' ? 'monthlyRank' : 'lifetimeRank';
    const total = await Leaderboard.countDocuments();
    const leaderboard = await Leaderboard.find()
      .sort({ [pointsField]: -1 })
      .skip(skip)
      .limit(limit)
      .select(`username ${pointsField} ${rankField} badges`)
      .exec();
    res.json({
      status: 'success',
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      },
      data: leaderboard
    });
  } catch (error) {
    console.error('Get full leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard'
    });
  }
};
exports.recalculateRanks = async (req, res) => {
  try {
    await LeaderboardService.calculateRanks();
    res.json({
      status: 'success',
      message: 'Ranks recalculated successfully'
    });
  } catch (error) {
    console.error('Recalculate ranks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recalculate ranks'
    });
  }
};
exports.recalculateMonthlyPoints = async (req, res) => {
  try {
    const success = await LeaderboardService.recalculateMonthlyPoints();
    if (success) {
      res.json({
        status: 'success',
        message: 'Monthly points recalculated successfully',
        timestamp: new Date()
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to recalculate monthly points'
      });
    }
  } catch (error) {
    console.error('Recalculate monthly points error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recalculate monthly points'
    });
  }
};
exports.getTopThree = async (req, res) => {
  try {
    const topThree = await Leaderboard.find()
      .sort({ monthlyPoints: -1 })
      .limit(3)
      .select('username monthlyPoints monthlyRank badges')
      .exec();
    const formattedData = topThree.map((entry, index) => ({
      position: index + 1,
      username: entry.username,
      points: entry.monthlyPoints,
      badge: ['🥇', '🥈', '🥉'][index] || ''
    }));
    res.json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    console.error('Get top three error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top three users'
    });
  }
};
