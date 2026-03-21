const cron = require('node-cron');
const LeaderboardService = require('../services/leaderboardService');
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
