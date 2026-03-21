const cron = require('node-cron');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const emailService = require('../utils/emailService');
const budgetAlertMonitor = () => {
  const task = cron.schedule('0 9 * * *', async () => {
    try {
      console.log('🔎 Running daily budget alert monitor...');
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const budgets = await Budget.find({ month, year }).lean();
      for (const b of budgets) {
        try {
          const percentUsed = (b.spent / (b.amount || 1)) * 100;
          const thresholdPercent = (b.alertThreshold || 0.8) * 100;
          const budget = await Budget.findById(b._id);
          if (!budget) continue;
          const User = mongoose.model('User');
          const user = await User.findById(budget.userId).select('email budgetAlertEnabled');
          if (!user || !user.budgetAlertEnabled) continue; 
          let changed = false;
          if (!budget.alert80Sent && percentUsed >= thresholdPercent && percentUsed < 100) {
            await emailService.sendBudgetAlert(user.email, {
              category: budget.category,
              budgetAmount: budget.amount,
              spentAmount: budget.spent,
              threshold: thresholdPercent
            });
            budget.alert80Sent = true;
            changed = true;
          }
          if (!budget.alert100Sent && percentUsed >= 100) {
            const res = await emailService.sendOverBudget(user.email, {
              category: budget.category,
              budgetAmount: budget.amount,
              spentAmount: budget.spent
            });
            if (res && res.ok) {
              budget.alert100Sent = true;
              changed = true;
            } else {
              console.error('Failed to send over-budget email for budget', budget._id, res && res.error);
            }
          }
          if (changed) await budget.save();
        } catch (err) {
          console.error('Error processing budget alert for budget', b._id, err);
        }
      }
      console.log('✅ Daily budget alert monitor completed');
    } catch (error) {
      console.error('❌ Error in budget alert monitor:', error);
    }
  });
  return task;
};
module.exports = budgetAlertMonitor;
