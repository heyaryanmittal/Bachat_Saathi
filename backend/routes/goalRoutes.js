const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { protect } = require('../utils/authMiddleware');
router.use(protect);
router.route('/')
  .get(goalController.getGoals)
  .post(goalController.createGoal);
router.route('/:id')
  .get(goalController.getGoal)
  .patch(goalController.updateGoal)
  .delete(goalController.deleteGoal);
router.patch('/:id/savings', goalController.addSavingsToGoal);
router.get('/stats/overview', goalController.getGoalStats);
module.exports = router;
