const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { protect } = require('../utils/authMiddleware');

router.use(protect); // All budget routes are protected

router.route('/')
  .get(budgetController.getBudgets)
  .post(budgetController.createBudget);

router.route('/summary')
  .get(budgetController.getBudgetSummary);

router.route('/:id')
  .get(budgetController.getBudget)
  .patch(budgetController.updateBudget)
  .delete(budgetController.deleteBudget);

module.exports = router;
