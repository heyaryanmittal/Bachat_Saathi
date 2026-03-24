const express = require('express');
const router = express.Router();
const NetWorth = require('../models/NetWorth');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
router.use(auth);
router.get('/spending-analysis', reportController.getSpendingAnalysis);
router.get('/income', reportController.getIncomeReport);
router.get('/budget', reportController.getBudgetReport);
router.get('/summary', reportController.getReportSummary);
router.get('/csv/transactions', reportController.exportTransactionsCSV);
router.get('/csv/comprehensive', reportController.exportComprehensiveCSV);
router.get('/pdf/comprehensive', reportController.exportPDFReport);

router.get('/net-worth/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    const netWorthHistory = await NetWorth.find({ userId })
      .sort({ date: -1 })
    res.json({
      status: 'success',
      data: netWorthHistory
    });
  } catch (error) {
    console.error('Get net worth history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch net worth history'
    });
  }
});
router.get('/net-worth/current', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentNetWorth = await NetWorth.findOne({ userId })
      .sort({ date: -1 });
    if (!currentNetWorth) {
      return res.json({
        status: 'success',
        data: null,
        message: 'No net worth data found. Please add your assets and liabilities.'
      });
    }
    res.json({
      status: 'success',
      data: currentNetWorth
    });
  } catch (error) {
    console.error('Get current net worth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch current net worth'
    });
  }
});
router.post('/net-worth', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, assets, liabilities } = req.body;
    const totalAssets = Object.values(assets).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    const netWorthEntry = await NetWorth.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        assets,
        liabilities,
        totalAssets,
        totalLiabilities,
        netWorth
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({
      status: 'success',
      data: netWorthEntry
    });
  } catch (error) {
    console.error('Create/Update net worth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save net worth data'
    });
  }
});
router.delete('/net-worth/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deletedEntry = await NetWorth.findOneAndDelete({ _id: id, userId });
    if (!deletedEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Net worth entry not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Net worth entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete net worth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete net worth entry'
    });
  }
});
router.get('/net-worth/trends', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '6m' } = req.query; 
    let startDate = new Date();
    if (period === '1m') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === '3m') startDate.setMonth(startDate.getMonth() - 3);
    else if (period === '6m') startDate.setMonth(startDate.getMonth() - 6);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (period === 'all') startDate = new Date(0); 
    const trends = await NetWorth.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    res.json({
      status: 'success',
      data: trends
    });
  } catch (error) {
    console.error('Get net worth trends error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch net worth trends'
    });
  }
});
router.post('/net-worth/calculate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date = new Date() } = req.body;
    const walletBalances = {}; 
    const debts = {}; 
    const assets = {
      cash: walletBalances.cash || 0,
      bank: walletBalances.bank || 0,
      investments: walletBalances.investments || 0,
      otherAssets: 0 
    };
    const liabilities = {
      creditCards: debts.creditCards || 0,
      loans: debts.loans || 0,
      otherLiabilities: 0 
    };
    const totalAssets = Object.values(assets).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    const netWorthEntry = await NetWorth.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        assets,
        liabilities,
        totalAssets,
        totalLiabilities,
        netWorth
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({
      status: 'success',
      data: netWorthEntry
    });
  } catch (error) {
    console.error('Calculate net worth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate net worth'
    });
  }
});
module.exports = router;
