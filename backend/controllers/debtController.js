const Debt = require('../models/Debt');
const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const emailService = require('../utils/emailService');
const { clearUserCache } = require('../middleware/cache');
const mongoose = require('mongoose');
exports.createDebt = async (req, res) => {
  try {
    const { type, title, amount, interestRate, dueDate, description } = req.body;
    if (!type || !title || !amount || !dueDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Type, title, amount, and due date are required'
      });
    }
    const debt = new Debt({
      userId: req.user.id,
      type,
      title,
      amount: Number(amount),
      interestRate: interestRate ? Number(interestRate) : undefined,
      dueDate: new Date(dueDate),
      description
    });
    await debt.save();
    clearUserCache(req.user.id);
    res.status(201).json({
      status: 'success',
      message: 'Debt created successfully',
      data: debt
    });
  } catch (error) {
    console.error('Create debt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create debt'
    });
  }
};
exports.getDebts = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    const debts = await Debt.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limitNum * 1)
      .skip((pageNum - 1) * limitNum);
    const total = await Debt.countDocuments(filter);
    res.json({
      status: 'success',
      results: debts.length,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      data: debts
    });
  } catch (error) {
    console.error('Get debts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch debts'
    });
  }
};
exports.getDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!debt) {
      return res.status(404).json({
        status: 'error',
        message: 'Debt not found'
      });
    }
    res.json({
      status: 'success',
      data: debt
    });
  } catch (error) {
    console.error('Get debt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch debt'
    });
  }
};
exports.updateDebt = async (req, res) => {
  try {
    const { type, title, amount, interestRate, dueDate, description, remainingAmount } = req.body;
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!debt) {
      return res.status(404).json({
        status: 'error',
        message: 'Debt not found'
      });
    }
    if (type) debt.type = type;
    if (title) debt.title = title;
    if (amount) debt.amount = Number(amount);
    if (interestRate !== undefined) debt.interestRate = interestRate ? Number(interestRate) : undefined;
    if (dueDate) debt.dueDate = new Date(dueDate);
    if (description !== undefined) debt.description = description;
    if (remainingAmount !== undefined) debt.remainingAmount = Number(remainingAmount);
    await debt.save();
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Debt updated successfully',
      data: debt
    });
  } catch (error) {
    console.error('Update debt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update debt'
    });
  }
};
exports.deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!debt) {
      return res.status(404).json({
        status: 'error',
        message: 'Debt not found'
      });
    }
    if (debt.status !== 'closed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only closed debts can be deleted. Please pay off this debt first.'
      });
    }
    await Debt.findByIdAndDelete(req.params.id);
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Debt deleted successfully'
    });
  } catch (error) {
    console.error('Delete debt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete debt'
    });
  }
};
exports.updateDebtPayment = async (req, res) => {
  try {
    const { paymentAmount } = req.body;
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment amount must be greater than 0'
      });
    }
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!debt) {
      return res.status(404).json({
        status: 'error',
        message: 'Debt not found'
      });
    }
    if (debt.status === 'closed') {
      return res.status(400).json({
        status: 'error',
        message: 'Debt is already closed'
      });
    }
    const previousRemainingAmount = debt.remainingAmount;
    await debt.updateRemainingAmount(Number(paymentAmount));
    const actualPaymentAmount = previousRemainingAmount - debt.remainingAmount;
    const pointsEarned = Math.floor(actualPaymentAmount / 1000) * 10;
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { points: pointsEarned } }
      );
      await PointsLog.create({
        userId: req.user.id,
        points: pointsEarned,
        reason: 'debt_payment',
        description: `Earned ${pointsEarned} points for paying off ₹${paymentAmount} of debt: ${debt.title}`,
        relatedId: debt._id,
        relatedModel: 'Debt'
      });
    }
    if (debt.remainingAmount === 0 && debt.status !== 'completed') {
      const completionBonus = 1000;
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { points: completionBonus } }
      );
      await PointsLog.create({
        userId: req.user.id,
        points: completionBonus,
        reason: 'debt_completed',
        description: `Earned ${completionBonus} bonus points for fully paying off debt: ${debt.title}`,
        relatedId: debt._id,
        relatedModel: 'Debt'
      });
    }
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Debt payment updated successfully',
      data: {
        debt,
        pointsEarned
      }
    });
  } catch (error) {
    console.error('Update debt payment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update debt payment'
    });
  }
};
exports.updateDebtInterest = async (req, res) => {
  try {
    const { monthlyInterest, newRemainingAmount } = req.body;
    if (!monthlyInterest || monthlyInterest < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Monthly interest must be a positive number'
      });
    }
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!debt) {
      return res.status(404).json({
        status: 'error',
        message: 'Debt not found'
      });
    }
    if (debt.status === 'closed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot add interest to a closed debt'
      });
    }
    debt.remainingAmount = Number(newRemainingAmount);
    if (debt.interestHistory) {
      debt.interestHistory.push({
        amount: Number(monthlyInterest),
        calculatedAt: new Date()
      });
    }
    await debt.save();
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: `Interest calculated: ₹${monthlyInterest} added to debt`,
      data: debt
    });
  } catch (error) {
    console.error('Update debt interest error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update debt interest'
    });
  }
};
exports.getDebtStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Debt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalDebts: { $sum: 1 },
          activeDebts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          closedDebts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
            }
          },
          totalAmount: { $sum: '$amount' },
          totalRemaining: { $sum: '$remainingAmount' },
          overdueDebts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'active'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    res.json({
      status: 'success',
      data: stats[0] || {
        totalDebts: 0,
        activeDebts: 0,
        closedDebts: 0,
        totalAmount: 0,
        totalRemaining: 0,
        overdueDebts: 0
      }
    });
  } catch (error) {
    console.error('Get debt stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch debt statistics'
    });
  }
};
