const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
class LeaderboardService {
  static async updateUser(userId, pointsEarned, reason = 'points_earned') {
    try {
      const user = await User.findById(userId);
      if (!user) return null;
      user.points = (user.points || 0) + pointsEarned;
      await user.save();
      let entry = await Leaderboard.findOne({ userId });
      if (!entry) {
        entry = new Leaderboard({
          userId,
          username: user.name,
          monthlyPoints: pointsEarned,
          lifetimePoints: pointsEarned
        });
      } else {
        entry.monthlyPoints += pointsEarned;
        entry.lifetimePoints += pointsEarned;
      }
      await PointsLog.create({
        userId,
        points: pointsEarned,
        reason,
        description: `Earned ${pointsEarned} points for ${reason.replace(/_/g, ' ')}`
      });
      entry.lastUpdated = new Date();
      await entry.save();
      await this.calculateRanks();
      return entry;
    } catch (error) {
      console.error('LeaderboardService.updateUser error:', error);
      return null;
    }
  }
  static async calculateRanks() {
    try {
      const monthlyLeaderboard = await Leaderboard.find()
        .sort({ monthlyPoints: -1 })
        .exec();
      for (let i = 0; i < monthlyLeaderboard.length; i++) {
        monthlyLeaderboard[i].monthlyRank = i + 1;
        await this.assignMonthlyBadges(monthlyLeaderboard[i], i + 1);
        await monthlyLeaderboard[i].save();
      }
      const lifetimeLeaderboard = await Leaderboard.find()
        .sort({ lifetimePoints: -1 })
        .exec();
      for (let i = 0; i < lifetimeLeaderboard.length; i++) {
        lifetimeLeaderboard[i].lifetimeRank = i + 1;
        await this.assignLifetimeBadges(lifetimeLeaderboard[i], i + 1);
        await lifetimeLeaderboard[i].save();
      }
      console.log('Leaderboard ranks calculated successfully');
    } catch (error) {
      console.error('LeaderboardService.calculateRanks error:', error);
    }
  }
  static async assignMonthlyBadges(entry, rank) {
    try {
      if (!entry.badges) entry.badges = [];
      entry.badges = entry.badges.filter(badge => !badge.includes('monthly'));
      if (rank === 1) {
        if (!entry.badges.includes('saver_king_monthly')) {
          entry.badges.push('saver_king_monthly');
        }
      } else if (rank <= 3) {
        if (!entry.badges.includes('top_saver_monthly')) {
          entry.badges.push('top_saver_monthly');
        }
      } else if (rank <= 10) {
        if (!entry.badges.includes('smart_saver_monthly')) {
          entry.badges.push('smart_saver_monthly');
        }
      }
    } catch (error) {
      console.error('LeaderboardService.assignMonthlyBadges error:', error);
    }
  }
  static async assignLifetimeBadges(entry, rank) {
    try {
      if (!entry.badges) entry.badges = [];
      if (rank === 1) {
        if (!entry.badges.includes('saver_king')) {
          entry.badges.push('saver_king');
        }
      } else if (rank <= 3) {
        if (!entry.badges.includes('top_saver')) {
          entry.badges.push('top_saver');
        }
      } else if (rank <= 10) {
        if (!entry.badges.includes('smart_saver')) {
          entry.badges.push('smart_saver');
        }
      }
    } catch (error) {
      console.error('LeaderboardService.assignLifetimeBadges error:', error);
    }
  }
  static async getMonthlyLeaderboard(limit = 10) {
    try {
      return await Leaderboard.find()
        .sort({ monthlyPoints: -1 })
        .limit(limit)
        .select('username monthlyPoints monthlyRank badges')
        .exec();
    } catch (error) {
      console.error('LeaderboardService.getMonthlyLeaderboard error:', error);
      return [];
    }
  }
  static async getLifetimeLeaderboard(limit = 10) {
    try {
      return await Leaderboard.find()
        .sort({ lifetimePoints: -1 })
        .limit(limit)
        .select('username lifetimePoints lifetimeRank badges')
        .exec();
    } catch (error) {
      console.error('LeaderboardService.getLifetimeLeaderboard error:', error);
      return [];
    }
  }
  static async getUserStats(userId) {
    try {
      const entry = await Leaderboard.findOne({ userId })
        .select('monthlyPoints monthlyRank lifetimePoints lifetimeRank badges username');
      return entry || null;
    } catch (error) {
      console.error('LeaderboardService.getUserStats error:', error);
      return null;
    }
  }
  static async resetMonthlyPoints() {
    try {
      const now = new Date();
      const updated = await Leaderboard.updateMany(
        {},
        {
          monthlyPoints: 0,
          lastMonthlyReset: now
        }
      );
      console.log(`Monthly leaderboard reset. Updated ${updated.modifiedCount} entries`);
      await this.calculateRanks();
      return updated;
    } catch (error) {
      console.error('LeaderboardService.resetMonthlyPoints error:', error);
      return null;
    }
  }
  static async initializeUser(userId, username) {
    try {
      const existing = await Leaderboard.findOne({ userId });
      if (existing) return existing;
      const entry = new Leaderboard({
        userId,
        username,
        monthlyPoints: 0,
        lifetimePoints: 0
      });
      await entry.save();
      return entry;
    } catch (error) {
      console.error('LeaderboardService.initializeUser error:', error);
      return null;
    }
  }
  static async getUserRankContext(userId, type = 'monthly', range = 2) {
    try {
      const user = await Leaderboard.findOne({ userId });
      if (!user) return null;
      const rankField = type === 'monthly' ? 'monthlyRank' : 'lifetimeRank';
      const pointsField = type === 'monthly' ? 'monthlyPoints' : 'lifetimePoints';
      const userRank = type === 'monthly' ? user.monthlyRank : user.lifetimeRank;
      const startRank = Math.max(1, userRank - range);
      const endRank = userRank + range;
      const context = await Leaderboard.find({
        [rankField]: { $gte: startRank, $lte: endRank }
      })
        .sort({ [rankField]: 1 })
        .select(`username ${rankField} ${pointsField} badges`)
        .exec();
      return {
        userStats: {
          username: user.username,
          rank: userRank,
          points: type === 'monthly' ? user.monthlyPoints : user.lifetimePoints
        },
        context
      };
    } catch (error) {
      console.error('LeaderboardService.getUserRankContext error:', error);
      return null;
    }
  }
  static async recalculateMonthlyPoints() {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      console.log(`📅 Recalculating monthly points for ${currentMonthStart.toLocaleDateString()} to ${currentMonthEnd.toLocaleDateString()}`);
      const leaderboardEntries = await Leaderboard.find();
      for (const entry of leaderboardEntries) {
        const monthlyPointsResult = await PointsLog.aggregate([
          {
            $match: {
              userId: entry.userId,
              createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
          },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        const monthlyPoints = monthlyPointsResult.length > 0 ? monthlyPointsResult[0].total : 0;
        entry.monthlyPoints = monthlyPoints;
        entry.lastUpdated = new Date();
        await entry.save();
        console.log(`✅ Updated ${entry.username}: ${monthlyPoints} monthly points`);
      }
      await this.calculateRanks();
      console.log('✅ Monthly points recalculation completed and ranks updated');
      return true;
    } catch (error) {
      console.error('LeaderboardService.recalculateMonthlyPoints error:', error);
      return false;
    }
  }
}
module.exports = LeaderboardService;
