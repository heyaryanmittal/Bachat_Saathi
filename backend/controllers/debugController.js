const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const PointsLog = require('../models/PointsLog');
const LeaderboardService = require('../services/leaderboardService');
exports.sendTestEmail = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ ok: false, error: 'Debug endpoint disabled in production' });
  }
  const to = req.query.to || process.env.SMTP_USER || process.env.EMAIL_USER;
  if (!to) {
    return res.status(400).json({ ok: false, error: 'Missing `to` query param and no default sender configured' });
  }
  try {
    const result = await emailService.sendTestEmail(to);
    return res.json({ ok: true, result });
  } catch (err) {
    logger.error('Debug sendTestEmail failed:', err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
};
exports.verifySmtp = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ ok: false, error: 'Debug endpoint disabled in production' });
  }
  const nodemailer = require('nodemailer');
  const transporterOptions = {
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '1' ? true : false
    }
  };
  try {
    const tempTransporter = nodemailer.createTransport(transporterOptions);
    await tempTransporter.verify();
    return res.json({ ok: true, message: 'SMTP verification succeeded' });
  } catch (err) {
    logger.error('SMTP verification failed (debug):', err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err), details: err });
  }
};
exports.populateLeaderboard = async (req, res) => {
  try {
    console.log('🚀 Starting leaderboard population via API...\n');
    const users = await User.find({}).select('_id name email');
    console.log(`📊 Found ${users.length} users`);
    if (users.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No users found in database'
      });
    }
    const deleteResult = await Leaderboard.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing leaderboard entries`);
    let processedCount = 0;
    const userStats = [];
    for (const user of users) {
      try {
        const pointsResult = await PointsLog.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        const totalPoints = pointsResult.length > 0 ? pointsResult[0].total : 0;
        const leaderboardEntry = new Leaderboard({
          userId: user._id,
          username: user.name,
          monthlyPoints: 0,
          lifetimePoints: totalPoints,
          savingsAmount: 0,
          streak: 0,
          badges: [],
          lastUpdated: new Date(),
          lastMonthlyReset: new Date()
        });
        await leaderboardEntry.save();
        userStats.push({
          username: user.name,
          lifetimePoints: totalPoints
        });
        processedCount++;
        console.log(`✅ [${processedCount}/${users.length}] ${user.name} - ${totalPoints} points`);
      } catch (error) {
        console.error(`❌ Error processing user ${user.name}:`, error.message);
      }
    }
    console.log(`✅ Created ${processedCount} leaderboard entries`);
    console.log('📈 Calculating ranks and assigning badges...');
    await LeaderboardService.calculateRanks();
    const topUsers = await Leaderboard.find()
      .sort({ lifetimePoints: -1 })
      .limit(10)
      .select('username lifetimePoints lifetimeRank badges');
    const avgPoints = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$lifetimePoints' },
          max: { $max: '$lifetimePoints' },
          min: { $min: '$lifetimePoints' }
        }
      }
    ]);
    res.json({
      status: 'success',
      message: 'Leaderboard populated successfully',
      data: {
        processedUsers: processedCount,
        totalEntries: await Leaderboard.countDocuments(),
        topUsers: topUsers.map((u, i) => ({
          rank: i + 1,
          username: u.username,
          lifetimePoints: u.lifetimePoints,
          badges: u.badges
        })),
        statistics: avgPoints[0] || {
          avg: 0,
          max: 0,
          min: 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error populating leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to populate leaderboard',
      error: error.message
    });
  }
};
exports.getLeaderboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeaderboardEntries = await Leaderboard.countDocuments();
    const stats = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$lifetimePoints' },
          avgPoints: { $avg: '$lifetimePoints' },
          maxPoints: { $max: '$lifetimePoints' },
          minPoints: { $min: '$lifetimePoints' }
        }
      }
    ]);
    const topUser = await Leaderboard.findOne()
      .sort({ lifetimePoints: -1 })
      .select('username lifetimePoints');
    const bottomUser = await Leaderboard.findOne()
      .sort({ lifetimePoints: 1 })
      .select('username lifetimePoints');
    const usersWithBadges = await Leaderboard.countDocuments({ badges: { $exists: true, $ne: [] } });
    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalLeaderboardEntries,
        usersWithBadges,
        stats: stats[0] || {
          totalPoints: 0,
          avgPoints: 0,
          maxPoints: 0,
          minPoints: 0
        },
        topUser,
        bottomUser
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard stats',
      error: error.message
    });
  }
};
exports.recalculateLeaderboard = async (req, res) => {
  try {
    console.log('🔄 Recalculating leaderboard rankings...');
    await LeaderboardService.calculateRanks();
    const topUsers = await Leaderboard.find()
      .sort({ lifetimePoints: -1 })
      .limit(10)
      .select('username lifetimePoints lifetimeRank monthlyRank badges');
    res.json({
      status: 'success',
      message: 'Leaderboard recalculated successfully',
      data: {
        topUsers: topUsers.map((u, i) => ({
          rank: i + 1,
          username: u.username,
          lifetimePoints: u.lifetimePoints,
          monthlyRank: u.monthlyRank,
          badges: u.badges
        }))
      }
    });
  } catch (error) {
    console.error('Error recalculating leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recalculate leaderboard',
      error: error.message
    });
  }
};
exports.resetMonthlyLeaderboard = async (req, res) => {
  try {
    console.log('🔄 Resetting monthly leaderboard...');
    const updated = await Leaderboard.updateMany(
      {},
      {
        monthlyPoints: 0,
        lastMonthlyReset: new Date()
      }
    );
    console.log(`Updated ${updated.modifiedCount} entries`);
    await LeaderboardService.calculateRanks();
    res.json({
      status: 'success',
      message: 'Monthly leaderboard reset successfully',
      data: {
        entriesReset: updated.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error resetting monthly leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset monthly leaderboard',
      error: error.message
    });
  }
};
