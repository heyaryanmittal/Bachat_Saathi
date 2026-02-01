const cron = require('node-cron');
const Budget = require('../models/Budget');

/**
 * Monthly reset for budget alert flags
 * Runs on the 1st of every month at 00:05 AM
 * Schedule: 5 0 1 * *
 */
const resetBudgetAlerts = () => {
  const task = cron.schedule('5 0 1 * *', async () => {
    try {
      console.log('🔁 Resetting monthly budget alert flags...');
      // Reset all alert flags for budgets
      await Budget.updateMany({}, { $set: { alert80Sent: false, alert100Sent: false } });
      console.log('✅ Budget alert flags reset for all budgets');
    } catch (error) {
      console.error('❌ Error resetting budget alert flags:', error);
    }
  });

  return task;
};

module.exports = resetBudgetAlerts;
