#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const emailService = require('../utils/emailService');
async function runOnce({ month, year }) {
  const now = new Date();
  month = month || now.getMonth() + 1;
  year = year || now.getFullYear();
  console.log(`Running one-off budget monitor for ${month}/${year}`);
  const budgets = await Budget.find({ month, year });
  for (const budget of budgets) {
    try {
      const percentUsed = (budget.spent / (budget.amount || 1)) * 100;
      const thresholdPercent = (budget.alertThreshold || 0.8) * 100;
      const User = mongoose.model('User');
      const user = await User.findById(budget.userId).select('email budgetAlertEnabled emailNotificationsEnabled');
      if (!user) {
        console.log('Skipping budget', budget._id, 'no user found');
        continue;
      }
      console.log(`Budget ${budget._id} for ${user.email}: ${percentUsed.toFixed(2)}% used (threshold ${thresholdPercent}%) - alert80Sent=${!!budget.alert80Sent} alert100Sent=${!!budget.alert100Sent} userBudgetAlertEnabled=${!!user.budgetAlertEnabled}`);
      if (!user.budgetAlertEnabled) {
        console.log(`User ${user.email} has budget alerts disabled — skipping`);
        continue;
      }
      if (!budget.alert80Sent && percentUsed >= thresholdPercent && percentUsed < 100) {
        console.log(`Attempting threshold alert for ${user.email} (${budget.category})`);
        const res = await emailService.sendBudgetAlert(user.email, {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount: budget.spent,
          threshold: thresholdPercent
        });
        console.log('sendBudgetAlert result:', res);
        if (res && res.ok) {
          budget.alert80Sent = true;
          await budget.save();
          console.log('Marked alert80Sent=true for', budget._id);
        }
      }
      if (!budget.alert100Sent && percentUsed >= 100) {
        console.log(`Attempting exceeded alert for ${user.email} (${budget.category})`);
        const res = await emailService.sendOverBudget(user.email, {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount: budget.spent
        });
        console.log('sendOverBudget result:', res);
        if (res && res.ok) {
          budget.alert100Sent = true;
          await budget.save();
          console.log('Marked alert100Sent=true for', budget._id);
        }
      }
    } catch (err) {
      console.error('Error processing budget', budget._id, err);
    }
  }
}
async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI env var');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const argv = require('minimist')(process.argv.slice(2));
  const month = argv.month ? Number(argv.month) : undefined;
  const year = argv.year ? Number(argv.year) : undefined;
  await runOnce({ month, year });
  await mongoose.connection.close();
  process.exit(0);
}
main();
