const Goal = require('../models/Goal');
const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const { clearUserCache } = require('../middleware/cache');
const mongoose = require('mongoose');
exports.createGoal = async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category } = req.body;
    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, target amount, and deadline are required'
      });
    }
    const goal = new Goal({
      userId: req.user.id,
      title,
      description,
      targetAmount: Number(targetAmount),
      deadline: new Date(deadline),
      category: category || 'other'
    });
    await goal.save();
    clearUserCache(req.user.id);
    res.status(201).json({
      status: 'success',
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create goal'
    });
  }
};
exports.getGoals = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    const goals = await Goal.find(filter)
      .sort({ deadline: 1, createdAt: -1 })
      .limit(limitNum * 1)
      .skip((pageNum - 1) * limitNum);
    const total = await Goal.countDocuments(filter);
    res.json({
      status: 'success',
      results: goals.length,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      data: goals
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch goals'
    });
  }
};
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }
    res.json({
      status: 'success',
      data: goal
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch goal'
    });
  }
};
exports.updateGoal = async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category, savedAmount } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetAmount) goal.targetAmount = Number(targetAmount);
    if (deadline) goal.deadline = new Date(deadline);
    if (category) goal.category = category;
    if (savedAmount !== undefined) goal.savedAmount = Number(savedAmount);
    await goal.save();
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update goal'
    });
  }
};
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete goal'
    });
  }
};
exports.addSavingsToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Savings amount must be greater than 0'
      });
    }
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }
    if (goal.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Goal is already completed'
      });
    }
    const previousSavedAmount = goal.savedAmount;
    await goal.addSavings(Number(amount));
    const savingsPoints = Math.floor(amount / 1000) * 5;
    let pointsEarned = savingsPoints;
    if (goal.status === 'completed') {
      const completionBonus = 100;
      pointsEarned += completionBonus;
      await PointsLog.create({
        userId: req.user.id,
        points: completionBonus,
        reason: 'goal_completed',
        description: `Earned ${completionBonus} bonus points for completing goal: ${goal.title}`,
        relatedId: goal._id,
        relatedModel: 'Goal'
      });
    }
    if (savingsPoints > 0) {
      await PointsLog.create({
        userId: req.user.id,
        points: savingsPoints,
        reason: 'goal_savings',
        description: `Earned ${savingsPoints} points for adding ₹${amount} to goal: ${goal.title}`,
        relatedId: goal._id,
        relatedModel: 'Goal'
      });
    }
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { points: pointsEarned } }
      );
    }
    clearUserCache(req.user.id);
    res.json({
      status: 'success',
      message: 'Savings added to goal successfully',
      data: {
        goal,
        pointsEarned
      }
    });
  } catch (error) {
    console.error('Add savings to goal error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add savings to goal'
    });
  }
};
exports.getGoalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await Goal.find({ userId });
    let totalGoals = goals.length;
    let totalTargetAmount = 0;
    let totalSavedAmount = 0;
    let completedGoals = 0;
    let inProgressGoals = 0;
    let overdueGoals = 0;
    let totalProgress = 0;
    goals.forEach(goal => {
      const target = parseFloat(goal.targetAmount) || 0;
      const saved = parseFloat(goal.savedAmount) || 0;
      totalTargetAmount += target;
      totalSavedAmount += saved;
      const progress = target > 0 ? (saved / target) * 100 : 0;
      totalProgress += progress;
      if (saved >= target) {
        completedGoals++;
      } else {
        inProgressGoals++;
        if (goal.deadline && new Date(goal.deadline) < new Date()) {
          overdueGoals++;
        }
      }
    });
    const successRate = totalGoals > 0 
      ? Math.round((totalProgress / totalGoals) * 100) / 100 
      : 0;
    res.json({
      status: 'success',
      data: {
        totalGoals,
        completedGoals,
        inProgressGoals,
        totalTargetAmount,
        totalSavedAmount,
        successRate,
        overdueGoals
      }
    });
  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch goal statistics'
    });
  }
};
