const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { protect } = require('../utils/authMiddleware');

// All goal routes are protected
router.use(protect);

// Goal CRUD routes
router.route('/')
  .get(goalController.getGoals)
  .post(goalController.createGoal);

router.route('/:id')
  .get(goalController.getGoal)
  .patch(goalController.updateGoal)
  .delete(goalController.deleteGoal);

// Add savings to goal
router.patch('/:id/savings', goalController.addSavingsToGoal);

// Goal statistics
router.get('/stats/overview', goalController.getGoalStats);

module.exports = router;
