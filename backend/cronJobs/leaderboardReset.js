const cron = require('node-cron');
const LeaderboardService = require('../services/leaderboardService');

/**
 * Monthly Leaderboard Reset Cron Job
 * Runs on the 1st of every month at 00:05 AM (5 minutes past midnight)
 * Schedule: 5 0 1 * * (5 minutes, 0 hours, 1st day, any month, any day of week)
 */
const leaderboardResetJob = () => {
  const task = cron.schedule('5 0 1 * * *', async () => {
    try {
      console.log('🔄 Starting monthly leaderboard reset...');
      await LeaderboardService.resetMonthlyPoints();
      console.log('✅ Monthly leaderboard reset completed successfully');
    } catch (error) {
      console.error('❌ Error in leaderboard reset cron job:', error);
    }
  });

  return task;
};

module.exports = leaderboardResetJob;
