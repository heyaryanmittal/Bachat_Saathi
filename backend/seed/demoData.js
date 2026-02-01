const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const RecurringRule = require('../models/RecurringRule');

// Sample data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

const walletTypes = ['Cash', 'Bank', 'Card'];
const categories = [
  'Groceries',
  'Transportation',
  'Dining',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Education'
];

const merchants = {
  Groceries: ['BigBasket', 'Grofers', 'DMart', 'Reliance Fresh'],
  Transportation: ['Uber', 'Ola', 'Metro', 'Bus Pass'],
  Dining: ['Swiggy', 'Zomato', 'McDonald\'s', 'Domino\'s'],
  Shopping: ['Amazon', 'Flipkart', 'Myntra', 'local market'],
  Entertainment: ['Netflix', 'PVR', 'BookMyShow', 'Amazon Prime'],
  Bills: ['Electricity Board', 'Water Supply', 'Mobile Bill', 'Internet'],
  Health: ['Apollo Pharmacy', 'Local Clinic', '1mg', 'Gym'],
  Education: ['Udemy', 'Coursera', 'Local Library', 'Books']
};

const generateRandomAmount = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min) * 100;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }

    console.log('Starting database seed...');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Wallet.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      RecurringRule.deleteMany({})
    ]);

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash
      });
      
      createdUsers.push(user);
    }

    // Create wallets for each user
    for (const user of createdUsers) {
      const numWallets = Math.floor(Math.random() * 3) + 3; // 3-5 wallets
      
      for (let i = 0; i < numWallets; i++) {
        const openingBalance = generateRandomAmount(1000, 10000);
        await Wallet.create({
          userId: user._id,
          name: `${user.name}'s ${walletTypes[i % walletTypes.length]}`,
          type: walletTypes[i % walletTypes.length],
          openingBalance,
          currentBalance: openingBalance
        });
      }
    }

    // Create transactions and budgets for each user
    for (const user of createdUsers) {
      const userWallets = await Wallet.find({ userId: user._id });
      
      // Create 20-30 transactions per user
      const numTransactions = Math.floor(Math.random() * 11) + 20;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      for (let i = 0; i < numTransactions; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const merchantList = merchants[category];
        const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
        const wallet = userWallets[Math.floor(Math.random() * userWallets.length)];
        const amount = generateRandomAmount(100, 5000);
        const date = generateRandomDate(startDate, new Date());
        
        const transaction = await Transaction.create({
          userId: user._id,
          walletId: wallet._id,
          type: 'Expense',
          amount,
          currency: 'INR',
          category,
          merchant,
          date,
          tags: [category.toLowerCase(), merchant.toLowerCase()]
        });

        // Update wallet balance
        try {
          wallet.currentBalance = Number((wallet.currentBalance - amount).toFixed(2));
          await wallet.save();
        } catch (walletError) {
          console.error(`Error updating wallet balance: ${walletError.message}`);
          // Revert transaction if wallet update fails
          await Transaction.deleteOne({ _id: transaction._id });
          throw walletError;
        }
      }

      // Create budgets for each category
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      for (const category of categories) {
        await Budget.create({
          userId: user._id,
          category,
          amount: generateRandomAmount(5000, 15000),
          month: currentMonth,
          year: currentYear,
          alertThreshold: 0.8
        });
      }

      // Create some recurring rules
      const recurringCategories = ['Bills', 'Entertainment', 'Health'];
      for (const category of recurringCategories) {
        const wallet = userWallets[Math.floor(Math.random() * userWallets.length)];
        const merchantList = merchants[category];
        const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
        const amount = generateRandomAmount(500, 2000);
        
        // Create recurring rule
        const rule = await RecurringRule.create({
          userId: user._id,
          walletId: wallet._id,
          type: 'Expense',
          amount,
          category,
          merchant,
          description: `Recurring ${category.toLowerCase()} payment`,
          cadence: Math.random() > 0.5 ? 'monthly' : 'weekly',
          nextRunAt: new Date(),
          endsAt: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          isActive: true
        });

        // Create first transaction for the recurring rule
        const transaction = await Transaction.create({
          userId: user._id,
          walletId: wallet._id,
          type: 'Expense',
          amount,
          currency: 'INR',
          category,
          merchant,
          date: new Date(),
          tags: [category.toLowerCase(), merchant.toLowerCase(), 'recurring'],
          isRecurring: true,
          recurringRuleId: rule._id
        });

        // Update wallet balance
        try {
          wallet.currentBalance = Number((wallet.currentBalance - amount).toFixed(2));
          await wallet.save();
        } catch (walletError) {
          console.error(`Error updating wallet balance for recurring transaction: ${walletError.message}`);
          // Revert transaction if wallet update fails
          await Transaction.deleteOne({ _id: transaction._id });
          throw walletError;
        }
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Re-throw to ensure the error is not silently caught
  }
};

module.exports = seedDatabase;
