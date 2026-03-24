const { generateGeminiContent } = require('../services/geminiService');
const getGeminiResponse = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }
    const messages = [{ parts: [{ text: prompt }] }];
    const result = await generateGeminiContent(messages);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Debt = require('../models/Debt');
const NetWorth = require('../models/NetWorth');
const PointsLog = require('../models/PointsLog');
const MonthlySavingsTier = require('../models/MonthlySavingsTier');
const RecurringRule = require('../models/RecurringRule');
const Leaderboard = require('../models/Leaderboard');
const axios = require('axios');
require('dotenv').config();
const SYSTEM_MESSAGE = `You are a helpful financial assistant for BachatSaathi, a personal finance app. 
You help users understand their spending, savings, and financial habits.
Only provide information based on the user's transaction data and financial context.
Be concise, helpful, and professional in your responses.`;
const getFinancialContext = async (userId, period = '6 months') => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  let transactions = await Transaction.find({ userId, date: { $gte: sixMonthsAgo } }).sort({ date: -1 }).limit(50);
  if (!transactions || transactions.length === 0) {
    transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50);
  }
  const [
    wallets,
    budgets,
    goals,
    debts,
    netWorth,
    pointsLogs,
    monthlySavings,
    recurringRules,
    leaderboard
  ] = await Promise.all([
    Wallet.find({ userId }),
    Budget.find({ userId }),
    Goal.find({ userId }),
    Debt.find({ userId }),
    NetWorth.find({ userId }).sort({ date: -1 }).limit(1),
    PointsLog.find({ userId }).sort({ createdAt: -1 }).limit(20),
    MonthlySavingsTier.find({ userId }).sort({ year: -1, month: -1 }).limit(6),
    RecurringRule.find({ userId }),
    Leaderboard.findOne({ userId })
  ]);
  const income = transactions.filter(t => (t.type || '').trim().toLowerCase() === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => (t.type || '').trim().toLowerCase() === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const walletSummary = wallets.map(w => `${w.name} (${w.type}): ₹${w.currentBalance}`).join('; ');
  const budgetSummary = budgets.map(b => `${b.category}: ₹${b.spent}/₹${b.amount} (${b.month}/${b.year})`).join('; ');
  const goalSummary = goals.map(g => `${g.title}: ₹${g.savedAmount}/₹${g.targetAmount} (${g.status})`).join('; ');
  const debtSummary = debts.map(d => `${d.title}: ₹${d.remainingAmount}/₹${d.amount} (${d.status})`).join('; ');
  const netWorthValue = netWorth && netWorth.length > 0 ? netWorth[0].netWorth : null;
  const totalPoints = leaderboard ? leaderboard.lifetimePoints : 0;
  const monthlyPoints = leaderboard ? leaderboard.monthlyPoints : 0;
  const savingsSummary = monthlySavings.map(ms => `${ms.month}/${ms.year}: ₹${ms.netSavings} (${ms.tier})`).join('; ');
  const recurringSummary = recurringRules.map(r => `${r.type}: ₹${r.amount} (${r.category}, ${r.cadence})`).join('; ');
  return {
    income,
    expenses,
    transactionCount: transactions.length,
    walletSummary,
    budgetSummary,
    goalSummary,
    debtSummary,
    netWorth: netWorthValue,
    totalPoints,
    monthlyPoints,
    savingsSummary,
    recurringSummary,
    period,
    transactions 
  };
};
const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }
    const financialContext = await getFinancialContext(userId);
    let context = `User's Financial Summary:
Income: ₹${financialContext.income}
Expenses: ₹${financialContext.expenses}
Transactions: ${financialContext.transactionCount}
Wallets: ${financialContext.walletSummary}
Budgets: ${financialContext.budgetSummary}
Goals: ${financialContext.goalSummary}
Debts: ${financialContext.debtSummary}
Net Worth: ₹${financialContext.netWorth}
Points: Lifetime ${financialContext.totalPoints}, Monthly ${financialContext.monthlyPoints}
Monthly Savings: ${financialContext.savingsSummary}
Recurring: ${financialContext.recurringSummary}`;
    if (financialContext.transactions && financialContext.transactions.length > 0) {
      const expenseTransactions = financialContext.transactions.filter(t => (t.type || '').trim().toLowerCase() === 'expense');
      const incomeTransactions = financialContext.transactions.filter(t => (t.type || '').trim().toLowerCase() === 'income');
      if (expenseTransactions.length > 0) {
        const categoryTotals = {};
        expenseTransactions.forEach(t => {
          if (t.category && typeof t.category === 'string') {
            const cat = t.category.trim().toLowerCase();
            categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
          }
        });
        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
          context += `\nExpense Category Breakdown:`;
          sortedCategories.forEach(([cat, amt]) => {
            context += `\n- ${cat}: ₹${amt}`;
          });
        }
      }
      if (incomeTransactions.length > 0) {
        const incomeTotals = {};
        incomeTransactions.forEach(t => {
          if (t.category && typeof t.category === 'string') {
            const cat = t.category.trim().toLowerCase();
            incomeTotals[cat] = (incomeTotals[cat] || 0) + t.amount;
          }
        });
        const sortedIncome = Object.entries(incomeTotals).sort((a, b) => b[1] - a[1]);
        if (sortedIncome.length > 0) {
          context += `\nIncome Category Breakdown:`;
          sortedIncome.forEach(([cat, amt]) => {
            context += `\n- ${cat}: ₹${amt}`;
          });
        }
      }
    }
    const prompt = `${SYSTEM_MESSAGE}\n${context}\nUser: ${message}`;
    const geminiMessages = [{ parts: [{ text: prompt }] }];
    const geminiResult = await generateGeminiContent(geminiMessages);
    let aiResponse = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (!aiResponse) {
      return res.status(502).json({
        status: 'error',
        message: 'AI Assistant is temporarily unavailable. Please try again later.',
        error: 'Gemini API error.'
      });
    }
    return res.json({
      status: 'success',
      data: {
        response: aiResponse,
        context: financialContext
      }
    });
  } catch (error) {
    console.error('Error in AI assistant:', {
      message: error.message,
      stack: error.stack,
      originalError: error.originalError || error
    });
    return res.status(500).json({
      status: 'error',
      message: 'Error processing your request',
      error: error.message,
      details: error.details || 'No additional error details'
    });
  }
};
module.exports = {
  getGeminiResponse,
  chatWithAssistant
};