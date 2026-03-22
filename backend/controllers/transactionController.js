const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Budget = require('../models/Budget');
const { categorizeTransaction, suggestTags } = require('../utils/categoryTagger');
const emailService = require('../utils/emailService');
const { clearUserCache } = require('../middleware/cache');
const mongoose = require('mongoose');
const userController = require('./userController');
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, walletId, toWallet, category, notes, date } = req.body;
    const numericAmount = Number(amount);
    const transactionData = {
      userId: req.user.id,
      type,
      amount: numericAmount,
      walletId,
      date: date || new Date(),
      notes,
      currency: 'INR'
    };
    if (type !== 'Transfer') {
      if (!category) {
        return res.status(400).json({
          status: 'error',
          message: 'Category is required for Income/Expense transactions'
        });
      }
      transactionData.category = category;
    }
    if (type === 'Transfer') {
      if (!toWallet) {
        return res.status(400).json({
          status: 'error',
          message: 'Destination wallet is required for transfers'
        });
      }
      transactionData.toWallet = toWallet;
    }
    const transaction = await Transaction.create(transactionData);
    if (type === 'Transfer') {
      const [fromWallet, toWalletDoc] = await Promise.all([
        Wallet.findById(walletId),
        Wallet.findById(toWallet)
      ]);
      fromWallet.currentBalance = Number(fromWallet.currentBalance) - numericAmount;
      toWalletDoc.currentBalance = Number(toWalletDoc.currentBalance) + numericAmount;
      console.log("From Wallet New Balance:", fromWallet.currentBalance);
      await Promise.all([
        fromWallet.save(),
        toWalletDoc.save()
      ]);
    } else {
      const wallet = await Wallet.findById(walletId);
      wallet.currentBalance = Number(wallet.currentBalance) + 
        (type === 'Income' ? numericAmount : -numericAmount);
      await wallet.save();
    }
    clearUserCache(req.user.id);
    userController.awardMonthlySavingsPoints(req.user.id, new Date(transaction.date))
      .catch(error => console.error('Error calculating monthly savings points:', error));
    const transactionPoints = 10;
    require('../services/leaderboardService').updateUser(req.user.id, transactionPoints, 'transaction_recorded')
      .catch(e => console.error('Error updating leaderboard points for transaction:', e));
    if (type === 'Expense' && category) {
      const txnDate = new Date(transaction.date);
      const month = txnDate.getMonth() + 1;
      const year = txnDate.getFullYear();
      const budget = await Budget.findOne({
        userId: req.user.id,
        category,
        month,
        year
      });
      if (budget) {
        budget.spent = (budget.spent || 0) + numericAmount;
          const percentUsed = (budget.spent / (budget.amount || 1)) * 100;
          let alertSent = false;
          const user = await mongoose.model('User').findById(req.user.id);
          if (user && user.budgetAlertEnabled) {
            const thresholdPercent = (budget.alertThreshold || 0.8) * 100;
            if (!budget.alert80Sent && percentUsed >= thresholdPercent && percentUsed < 100) {
              try {
                const sendRes = await emailService.sendBudgetAlert(user.email, {
                  category,
                  budgetAmount: budget.amount,
                  spentAmount: budget.spent,
                  threshold: thresholdPercent
                });
                if (sendRes && sendRes.ok) {
                  budget.alert80Sent = true;
                  alertSent = true;
                  console.log(`Budget threshold alert sent to ${user.email} for ${category} (${percentUsed.toFixed(2)}% used)`);
                } else {
                  console.error(`Failed to send budget threshold alert to ${user.email} for ${category}:`, sendRes && sendRes.error);
                }
              } catch (err) {
                console.error('Error sending budget threshold alert:', err);
              }
            }
            if (!budget.alert100Sent && percentUsed >= 100) {
              try {
                const sendRes = await emailService.sendOverBudget(user.email, {
                  category,
                  budgetAmount: budget.amount,
                  spentAmount: budget.spent
                });
                if (sendRes && sendRes.ok) {
                  budget.alert100Sent = true;
                  alertSent = true;
                  console.log(`Budget exceeded alert sent to ${user.email} for ${category} (${percentUsed.toFixed(2)}% used)`);
                } else {
                  console.error(`Failed to send budget exceeded alert to ${user.email} for ${category}:`, sendRes && sendRes.error);
                }
              } catch (err) {
                console.error('Error sending budget exceeded alert:', err);
              }
            }
          }
          if (alertSent) await budget.save();
      }
    }
    res.status(201).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating transaction',
      error: error.message
    });
  }
};
exports.getTransactions = async (req, res) => {
  try {
    const {
      walletId,
      walletIds, 
      category,
      type,
      startDate,
      endDate,
      minAmount, 
      maxAmount, 
      search, 
      page = 1,
      limit = 10,
      sortBy = 'date', 
      sortOrder = 'desc', 
      includeStats = false 
    } = req.query;
    const query = { userId: req.user.id };
    if (walletIds) {
      const walletIdArray = walletIds.split(',').map(id => id.trim());
      query.walletId = { $in: walletIdArray };
    } else if (walletId) {
      query.walletId = walletId;
    }
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      query.notes = { $regex: search, $options: 'i' };
    }
    const skip = (page - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [transactions, total, stats] = await Promise.all([
      Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('walletId', 'name type')
        .lean(), 
      Transaction.countDocuments(query),
      includeStats === 'true' ? getTransactionStats(req.user.id, query) : null
    ]);
    const response = {
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
          hasNext: parseInt(page) < Math.ceil(total / limitNum),
          hasPrev: parseInt(page) > 1
        }
      }
    };
    if (stats) {
      response.data.stats = stats;
    }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};
const getTransactionStats = async (userId, baseQuery = {}) => {
  const query = { ...baseQuery, userId };
  const stats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  const result = {
    totalIncome: 0,
    totalExpenses: 0,
    totalTransactions: 0,
    netFlow: 0
  };
  stats.forEach(stat => {
    if (stat._id === 'Income') {
      result.totalIncome = stat.total;
    } else if (stat._id === 'Expense') {
      result.totalExpenses = stat.total;
    }
    result.totalTransactions += stat.count;
  });
  result.netFlow = result.totalIncome - result.totalExpenses;
  return result;
};
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
    .populate('walletId', 'name type')
    .lean(); 
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};
exports.getTransactionStats = async (req, res) => {
  try {
    const {
      walletId,
      category,
      type,
      startDate,
      endDate
    } = req.query;
    const query = { userId: req.user.id };
    if (walletId) query.walletId = walletId;
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const stats = await getTransactionStats(req.user.id, query);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transaction stats',
      error: error.message
    });
  }
};
exports.updateTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      merchant,
      notes,
      tags,
      date
    } = req.body;
    const oldTransaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!oldTransaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    const { walletId: newWalletId, type: newType, amount: newAmount } = req.body;
    const oldWalletId = oldTransaction.walletId;
    const isWalletChanged = newWalletId && newWalletId.toString() !== oldWalletId.toString();

    // 1. Revert balance on OLD wallet
    const oldWallet = await Wallet.findById(oldWalletId);
    if (oldWallet) {
      oldWallet.currentBalance -= oldTransaction.type === 'Income'
        ? oldTransaction.amount
        : -oldTransaction.amount;
      await oldWallet.save();
    }

    // 2. Update transaction
    oldTransaction.type = newType || oldTransaction.type;
    oldTransaction.amount = newAmount !== undefined ? Number(newAmount) : oldTransaction.amount;
    oldTransaction.walletId = newWalletId || oldTransaction.walletId;
    oldTransaction.category = category || oldTransaction.category;
    oldTransaction.notes = notes || oldTransaction.notes;
    oldTransaction.date = date || oldTransaction.date;
    await oldTransaction.save();

    // 3. Apply balance to NEW (or same) wallet
    const targetWalletId = oldTransaction.walletId;
    const targetWallet = isWalletChanged ? await Wallet.findById(targetWalletId) : oldWallet;
    
    if (targetWallet) {
      targetWallet.currentBalance += oldTransaction.type === 'Income'
        ? oldTransaction.amount
        : -oldTransaction.amount;
      await targetWallet.save();
    }

    clearUserCache(req.user.id);
    userController.awardMonthlySavingsPoints(req.user.id, new Date(oldTransaction.date))
      .catch(error => console.error('Error updating monthly savings points:', error));
    res.json({
      status: 'success',
      data: oldTransaction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating transaction',
      error: error.message
    });
  }
};
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid transaction ID'
      });
    }
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id
    });
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    try {
      const wallet = await Wallet.findById(transaction.walletId);
      if (wallet) {
        wallet.currentBalance -= transaction.type === 'Income'
          ? transaction.amount
          : -transaction.amount;
        await wallet.save();
      } else {
        console.warn(`Wallet not found for transaction ${transaction._id}`);
      }
    } catch (walletError) {
      console.error('Error updating wallet during transaction delete:', walletError);
    }
    await transaction.deleteOne(); 
    clearUserCache(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};