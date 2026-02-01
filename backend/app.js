
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
// AI Assistant Gemini route
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');

// Import routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Phase 2 routes
const debtRoutes = require('./routes/debtRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const monthlySavingsTierRoutes = require('./routes/monthlySavingsTierRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Leaderboard routes
const leaderboardRoutes = require('./routes/leaderboardRoutes');

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: '*', // Allow all for now, or configure as needed
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.send('Bachat Saathi API is running correctly');
});
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/contact', contactRoutes);

// Phase 2 routes
app.use('/api/debts', debtRoutes);
app.use('/api/goals', goalRoutes);

// Financial Insights & AI Assistant
const insightRoutes = require('./routes/insightRoutes');
app.use('/api/insights', insightRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/monthly-tiers', monthlySavingsTierRoutes);
// Leaderboard routes
app.use('/api/leaderboard', leaderboardRoutes);
// Development debug routes (test email sending)
app.use('/api/debug', debugRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: err.message
  });
});

module.exports = app;
