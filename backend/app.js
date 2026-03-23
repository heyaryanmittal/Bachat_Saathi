
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const contactRoutes = require('./routes/contactRoutes');
const debtRoutes = require('./routes/debtRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const monthlySavingsTierRoutes = require('./routes/monthlySavingsTierRoutes');

const leaderboardRoutes = require('./routes/leaderboardRoutes');
const app = express();
const corsOptions = {
  origin: '*', 
  credentials: true,
  optionsSuccessStatus: 200 
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.get('/', (req, res) => {
  res.send('Bachat Saathi API is running correctly');
});
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/goals', goalRoutes);
const insightRoutes = require('./routes/insightRoutes');
app.use('/api/insights', insightRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/monthly-tiers', monthlySavingsTierRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: err.message
  });
});
module.exports = app;
