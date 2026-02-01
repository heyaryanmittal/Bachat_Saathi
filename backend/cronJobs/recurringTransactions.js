const cron = require('node-cron');
const RecurringRule = require('../models/RecurringRule');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// Helper function to get next run date based on cadence
const getNextRunDate = (cadence, currentDate = new Date()) => {
  const nextDate = new Date(currentDate);
  
  switch (cadence) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      throw new Error('Invalid cadence');
  }
  
  return nextDate;
};

// Process recurring transactions
const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    
    // Find all rules that need to be processed
    const rules = await RecurringRule.find({
      nextRunAt: { $lte: now },
      $or: [
        { endsAt: { $gt: now } },
        { endsAt: null }
      ]
    });

    for (const rule of rules) {
      // Create transaction
      const transaction = await Transaction.create({
        userId: rule.userId,
        walletId: rule.walletId,
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        date: now,
        isRecurring: true,
        recurringRuleId: rule._id,
        currency: 'INR'
      });

      // Update wallet balance
      const wallet = await Wallet.findById(rule.walletId);
      if (wallet) {
        wallet.currentBalance += rule.type === 'Income' ? rule.amount : -rule.amount;
        await wallet.save();
      }

      // Update next run date
      rule.nextRunAt = getNextRunDate(rule.cadence, now);
      await rule.save();
    }

    console.log(`Processed ${rules.length} recurring transactions`);
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
};

// Schedule cron job to run every hour
// In production, you might want to adjust this based on your needs
cron.schedule('0 * * * *', processRecurringTransactions);

// Export for testing
module.exports = {
  processRecurringTransactions,
  getNextRunDate
};
