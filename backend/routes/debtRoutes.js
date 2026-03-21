const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { protect } = require('../utils/authMiddleware');
router.use(protect);
router.route('/')
  .get(debtController.getDebts)
  .post(debtController.createDebt);
router.route('/:id')
  .get(debtController.getDebt)
  .patch(debtController.updateDebt)
  .delete(debtController.deleteDebt);
router.patch('/:id/payment', debtController.updateDebtPayment);
router.patch('/:id/interest', debtController.updateDebtInterest);
router.get('/stats/overview', debtController.getDebtStats);
module.exports = router;
