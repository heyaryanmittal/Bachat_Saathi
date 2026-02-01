const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const { protect } = require('../utils/authMiddleware');

router.use(protect); // All recurring rule routes are protected

router.route('/')
  .get(recurringController.getRecurringRules)
  .post(recurringController.createRecurringRule);

router.route('/:id')
  .get(recurringController.getRecurringRule)
  .patch(recurringController.updateRecurringRule)
  .delete(recurringController.deleteRecurringRule);

module.exports = router;
