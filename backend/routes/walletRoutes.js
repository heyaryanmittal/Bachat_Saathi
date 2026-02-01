const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { protect } = require('../utils/authMiddleware');

router.use(protect); // All wallet routes are protected

router.route('/')
  .get(walletController.getWallets)
  .post(walletController.createWallet);

router.route('/:id')
  .get(walletController.getWallet)
  .put(walletController.updateWallet)
  .delete(walletController.deleteWallet);

module.exports = router;
