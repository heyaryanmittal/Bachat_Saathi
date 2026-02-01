const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Create wallet
exports.createWallet = async (req, res) => {
  try {
    const { name, type, openingBalance } = req.body;
    
    const wallet = await Wallet.create({
      userId: req.user.id,
      name,
      type,
      openingBalance,
      currentBalance: openingBalance
    });

    res.status(201).json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating wallet',
      error: error.message
    });
  }
};

// Get all wallets for user
exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user.id });
    res.status(200).json({
      status: 'success',
      data: { wallets }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching wallets',
      error: error.message
    });
  }
};

// Get single wallet
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching wallet',
      error: error.message
    });
  }
};

// Update wallet
exports.updateWallet = async (req, res) => {
  try {
    const { name, type, openingBalance } = req.body;
    const updateFields = { name, type };
    let newOpeningBalance = null;
    if (typeof openingBalance === 'number') {
      updateFields.openingBalance = openingBalance;
      newOpeningBalance = openingBalance;
    }

    // Update wallet (without touching currentBalance yet)
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    // If openingBalance was updated, recalculate currentBalance
    if (newOpeningBalance !== null) {
      // Get all transactions for this wallet
      const transactions = await require('../models/Transaction').find({ walletId: wallet._id });
      let income = 0, expense = 0;
      transactions.forEach(t => {
        if (t.type === 'Income') income += t.amount;
        if (t.type === 'Expense') expense += t.amount;
      });
      wallet.currentBalance = newOpeningBalance + income - expense;
      await wallet.save();
    }

    res.status(200).json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating wallet',
      error: error.message
    });
  }
};

// Delete wallet
exports.deleteWallet = async (req, res) => {
  try {
    // First, check if wallet exists and belongs to user
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    // Calculate 12 hours ago from now (for wallet creation check)
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Check if wallet was created within the last 12 hours
    if (wallet.createdAt > twelveHoursAgo) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete wallet created within the last 12 hours. Please wait before deleting this wallet.'
      });
    }

    // Calculate 24 hours ago from now (for transaction check)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Check if wallet has any transactions within the last 24 hours
    const recentTransactionCount = await Transaction.countDocuments({
      walletId: req.params.id,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (recentTransactionCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete wallet with transactions created within the last 24 hours. Please try again later.'
      });
    }

    // If all checks pass, delete the wallet
    await Wallet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Wallet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting wallet',
      error: error.message
    });
  }
};
