const RecurringRule = require('../models/RecurringRule');
const Wallet = require('../models/Wallet');
const { getNextRunDate } = require('../cronJobs/recurringTransactions');

// Create recurring rule
exports.createRecurringRule = async (req, res) => {
  try {
    const {
      walletId,
      type,
      amount,
      category,
      cadence,
      startDate,
      endsAt
    } = req.body;

    // Validate wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      userId: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    const nextRunAt = getNextRunDate(cadence, startDate ? new Date(startDate) : new Date());

    const recurringRule = await RecurringRule.create({
      userId: req.user.id,
      walletId,
      type,
      amount,
      category,
      cadence,
      nextRunAt,
      endsAt: endsAt ? new Date(endsAt) : null
    });

    res.status(201).json({
      status: 'success',
      data: { recurringRule }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating recurring rule',
      error: error.message
    });
  }
};

// Get all recurring rules for user
exports.getRecurringRules = async (req, res) => {
  try {
    const rules = await RecurringRule.find({
      userId: req.user.id
    }).populate('walletId', 'name type');

    res.status(200).json({
      status: 'success',
      data: { rules }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching recurring rules',
      error: error.message
    });
  }
};

// Get single recurring rule
exports.getRecurringRule = async (req, res) => {
  try {
    const rule = await RecurringRule.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('walletId', 'name type');

    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Recurring rule not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { rule }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching recurring rule',
      error: error.message
    });
  }
};

// Update recurring rule
exports.updateRecurringRule = async (req, res) => {
  try {
    const {
      amount,
      category,
      cadence,
      endsAt
    } = req.body;

    const updates = {
      amount,
      category,
      cadence,
      endsAt: endsAt ? new Date(endsAt) : null
    };

    // If cadence is updated, recalculate next run date
    if (cadence) {
      updates.nextRunAt = getNextRunDate(cadence);
    }

    const rule = await RecurringRule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate('walletId', 'name type');

    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Recurring rule not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { rule }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating recurring rule',
      error: error.message
    });
  }
};

// Delete recurring rule
exports.deleteRecurringRule = async (req, res) => {
  try {
    const rule = await RecurringRule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Recurring rule not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Recurring rule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting recurring rule',
      error: error.message
    });
  }
};
