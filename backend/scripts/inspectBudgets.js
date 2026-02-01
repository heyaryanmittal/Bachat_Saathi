#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const User = require('../models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in environment. Set it in .env or pass it in the environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const argv = require('minimist')(process.argv.slice(2));
  const month = argv.month || (new Date()).getMonth() + 1;
  const year = argv.year || (new Date()).getFullYear();
  const category = argv.category; // optional
  const userEmail = argv.userEmail; // optional
  const minPercent = argv.minPercent ? Number(argv.minPercent) : 70; // default show budgets >=70%

  const query = { month: Number(month), year: Number(year) };
  if (category) query.category = category;

  try {
    let budgets = await Budget.find(query).lean();

    if (userEmail) {
      const user = await User.findOne({ email: userEmail }).lean();
      if (!user) {
        console.error('No user found for', userEmail);
        process.exit(1);
      }
      budgets = budgets.filter(b => String(b.userId) === String(user._id));
    }

    const output = [];
    for (const b of budgets) {
      const percentUsed = (b.spent / (b.amount || 1)) * 100;
      if (percentUsed < minPercent) continue;
      const user = await User.findById(b.userId).lean();
      output.push({
        budgetId: b._id,
        userId: b.userId,
        userEmail: user?.email,
        budgetCategory: b.category,
        month: b.month,
        year: b.year,
        amount: b.amount,
        spent: b.spent,
        percentUsed: Number(percentUsed.toFixed(2)),
        alertThreshold: b.alertThreshold || 0.8,
        alert80Sent: !!b.alert80Sent,
        alert100Sent: !!b.alert100Sent,
        userBudgetAlertEnabled: !!user?.budgetAlertEnabled,
        userEmailNotificationsEnabled: !!user?.emailNotificationsEnabled
      });
    }

    if (output.length === 0) {
      console.log('No budgets matched the criteria.');
    } else {
      console.table(output);
    }
  } catch (err) {
    console.error('Error inspecting budgets:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
