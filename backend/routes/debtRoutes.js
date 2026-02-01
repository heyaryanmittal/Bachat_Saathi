const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { protect } = require('../utils/authMiddleware');

// All debt routes are protected
router.use(protect);

// Debt CRUD routes
router.route('/')
  .get(debtController.getDebts)
  .post(debtController.createDebt);

router.route('/:id')
  .get(debtController.getDebt)
  .patch(debtController.updateDebt)
  .delete(debtController.deleteDebt);

// Debt payment update
router.patch('/:id/payment', debtController.updateDebtPayment);

// Debt interest calculation
router.patch('/:id/interest', debtController.updateDebtInterest);

// Debt statistics
router.get('/stats/overview', debtController.getDebtStats);

module.exports = router;
