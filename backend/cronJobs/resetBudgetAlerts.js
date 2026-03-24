const cron = require('node-cron');
const Budget = require('../models/Budget');
const resetBudgetAlerts = () => {
  const task = cron.schedule('5 0 1 * *', async () => {
    try {
      const now = new Date();
      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const User = require('../models/User');
      const LeaderboardService = require('../services/leaderboardService');
      const allBudgets = await Budget.find({ month: prevMonth, year: prevYear });
      const userBudgets = {};
      allBudgets.forEach(b => {
        if (!userBudgets[b.userId]) userBudgets[b.userId] = { allUnder: true, hasBudgets: true };
        if (b.spent > b.amount) userBudgets[b.userId].allUnder = false;
      });
      for (const userId in userBudgets) {
        if (userBudgets[userId].allUnder && userBudgets[userId].hasBudgets) {
          const user = await User.findById(userId);
          if (user) {
            const firstDateOfMonth = new Date(prevYear, prevMonth - 1, 1);
            if (!user.budgetComplianceMonths.some(d => d.getTime() === firstDateOfMonth.getTime())) {
              user.budgetComplianceMonths.push(firstDateOfMonth);
              if (!user.firstBudgetDate) user.firstBudgetDate = firstDateOfMonth;
              await user.save();
              await LeaderboardService.updateUser(userId, 100, 'monthly_budget_compliance');
            }
          }
        }
      }
      await Budget.updateMany({}, { $set: { alert80Sent: false, alert100Sent: false } });
    } catch (error) {
      console.error('❌ Error processing budget reset:', error);
    }
  });
  return task;
};
module.exports = resetBudgetAlerts;
