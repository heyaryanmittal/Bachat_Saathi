const cron = require('node-cron');
const LeaderboardService = require('../services/leaderboardService');
const leaderboardResetJob = () => {
  const task = cron.schedule('5 0 1 * * *', async () => {
    try {
      await LeaderboardService.resetMonthlyPoints();
    } catch (error) {
      console.error('❌ Error in leaderboard reset cron job:', error);
    }
  });
  return task;
};
module.exports = leaderboardResetJob;
