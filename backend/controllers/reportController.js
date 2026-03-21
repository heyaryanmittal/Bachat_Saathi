const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const NetWorth = require('../models/NetWorth');
const mongoose = require('mongoose');
exports.getSpendingAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'Expense',
    };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }
    const spendingByCategory = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    const totalSpending = spendingByCategory.reduce((sum, item) => sum + item.total, 0);
    const categories = spendingByCategory.map(item => ({
      ...item,
      percentage: Math.round((item.total / totalSpending) * 100) || 0
    }));
    res.json({
      status: 'success',
      data: {
        categories,
        totalSpending,
        period: {
          start: startDate || 'Beginning',
          end: endDate || 'Now'
        }
      }
    });
  } catch (error) {
    console.error('Get spending analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate spending analysis'
    });
  }
};
exports.getIncomeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'Income',
    };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }
    const incomeBySource = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    const totalIncome = incomeBySource.reduce((sum, item) => sum + item.total, 0);
    const sources = incomeBySource.map(item => ({
      ...item,
      percentage: Math.round((item.total / totalIncome) * 100) || 0
    }));
    res.json({
      status: 'success',
      data: {
        sources,
        totalIncome,
        period: {
          start: startDate || 'Beginning',
          end: endDate || 'Now'
        }
      }
    });
  } catch (error) {
    console.error('Get income report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate income report'
    });
  }
};
exports.getBudgetReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    const startYear = start.getFullYear();
    const startMonth = start.getMonth() + 1;
    const endYear = end.getFullYear();
    const endMonth = end.getMonth() + 1;
    const budgetQuery = {
      userId,
      $or: []
    };
    if (startYear === endYear) {
      budgetQuery.$or.push({
        year: startYear,
        month: { $gte: startMonth, $lte: endMonth }
      });
    } else {
      budgetQuery.$or.push({ year: startYear, month: { $gte: startMonth } });
      budgetQuery.$or.push({ year: endYear, month: { $lte: endMonth } });
      if (endYear - startYear > 1) {
        budgetQuery.$or.push({ year: { $gt: startYear, $lt: endYear } });
      }
    }
    const rawBudgets = await Budget.find(budgetQuery);
    const aggregatedBudgets = {};
    rawBudgets.forEach(b => {
      if (!aggregatedBudgets[b.category]) {
        aggregatedBudgets[b.category] = {
          category: b.category,
          amount: 0,
          spent: 0 
        };
      }
      aggregatedBudgets[b.category].amount += b.amount;
    });
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'Expense',
      date: { $gte: start, $lte: end }
    };
    const categorySpending = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          spent: { $sum: { $abs: '$amount' } }
        }
      }
    ]);
    const budgetReport = Object.values(aggregatedBudgets).map(budget => {
      const spending = categorySpending.find(s => s._id === budget.category);
      const spent = spending ? spending.spent : 0;
      const remaining = Math.max(0, budget.amount - spent);
      const percentage = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount
      };
    });
    const totalBudget = budgetReport.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = budgetReport.reduce((sum, b) => sum + b.spent, 0);
    res.json({
      status: 'success',
      data: {
        budgets: budgetReport,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        totalBudget,
        totalSpent
      }
    });
  } catch (error) {
    console.error('Get budget report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate budget report'
    });
  }
};
exports.exportTransactionsCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, category, reportType } = req.query;
    const userId = req.user.id;
    let filter = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (type) filter.type = type;
    if (category) filter.category = category;
    const transactions = await Transaction.find(filter)
      .populate('walletId', 'name type')
      .sort({ date: -1 });
    let csvHeader = '';
    let csvData = '';
    switch (reportType) {
      case 'spending':
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = transactions
          .filter(t => t.type === 'Expense')
          .map(transaction => {
            const date = transaction.date.toISOString().split('T')[0];
            const category = transaction.category || 'N/A';
            const amount = Math.abs(transaction.amount);
            const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
            const description = transaction.description || 'N/A';
            return `"${date}","${category}","${amount}","${wallet}","${description}"`;
          }).join('\n');
        break;
      case 'income':
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = transactions
          .filter(t => t.type === 'Income')
          .map(transaction => {
            const date = transaction.date.toISOString().split('T')[0];
            const category = transaction.category || 'N/A';
            const amount = transaction.amount;
            const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
            const description = transaction.description || 'N/A';
            return `"${date}","${category}","${amount}","${wallet}","${description}"`;
          }).join('\n');
        break;
      case 'cashflow':
        csvHeader = 'Date,Type,Amount,Category,Wallet,Description\n';
        csvData = transactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const type = transaction.type;
          const amount = transaction.amount;
          const category = transaction.category || 'N/A';
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${type}","${amount}","${category}","${wallet}","${description}"`;
        }).join('\n');
        break;
      case 'category':
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = transactions
          .filter(t => t.type === 'Expense')
          .map(transaction => {
            const date = transaction.date.toISOString().split('T')[0];
            const category = transaction.category || 'N/A';
            const amount = Math.abs(transaction.amount);
            const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
            const description = transaction.description || 'N/A';
            return `"${date}","${category}","${amount}","${wallet}","${description}"`;
          }).join('\n');
        break;
      default:
        csvHeader = 'Date,Type,Amount,Category,Wallet,Description,Notes\n';
        csvData = transactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const type = transaction.type;
          const amount = transaction.amount;
          const category = transaction.category || 'N/A';
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          const notes = transaction.notes || 'N/A';
          return `"${date}","${type}","${amount}","${category}","${wallet}","${description}","${notes}"`;
        }).join('\n');
    }
    const csvContent = csvHeader + csvData;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType || 'transactions'}-report.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export transactions CSV error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export transactions CSV'
    });
  }
};
exports.exportComprehensiveCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const [transactions, wallets, budgets, goals, debts] = await Promise.all([
      Transaction.find({ userId }).populate('walletId', 'name type').sort({ date: -1 }),
      Wallet.find({ userId }),
      Budget.find({ userId }).sort({ month: -1 }),
      Goal.find({ userId }),
      Debt.find({ userId })
    ]);
    let csvContent = '';
    csvContent += '=== TRANSACTIONS ===\n';
    csvContent += 'Date,Type,Amount,Category,Wallet,Notes\n';
    transactions.forEach(transaction => {
      csvContent += `"${transaction.date.toISOString().split('T')[0]}","${transaction.type}","${transaction.amount}","${transaction.category || 'N/A'}","${transaction.walletId?.name || 'N/A'}","${transaction.notes || 'N/A'}"\n`;
    });
    csvContent += '\n=== WALLETS ===\n';
    csvContent += 'Name,Type,Balance,Currency\n';
    wallets.forEach(wallet => {
      csvContent += `"${wallet.name}","${wallet.type}","${wallet.balance}","${wallet.currency}"\n`;
    });
    csvContent += '\n=== BUDGETS ===\n';
    csvContent += 'Month,Category,Budgeted,Spent,Remaining\n';
    budgets.forEach(budget => {
      csvContent += `"${budget.month}","${budget.category}","${budget.budgetedAmount}","${budget.spentAmount}","${budget.remainingAmount}"\n`;
    });
    csvContent += '\n=== GOALS ===\n';
    csvContent += 'Title,Target Amount,Saved Amount,Remaining,Status,Deadline\n';
    goals.forEach(goal => {
      csvContent += `"${goal.title}","${goal.targetAmount}","${goal.savedAmount}","${goal.remainingAmount}","${goal.status}","${goal.deadline.toISOString().split('T')[0]}"\n`;
    });
    csvContent += '\n=== DEBTS ===\n';
    csvContent += 'Title,Type,Amount,Remaining,Interest Rate,Status,Due Date\n';
    debts.forEach(debt => {
      csvContent += `"${debt.title}","${debt.type}","${debt.amount}","${debt.remainingAmount}","${debt.interestRate || 'N/A'}","${debt.status}","${debt.dueDate.toISOString().split('T')[0]}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=comprehensive-report.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export comprehensive CSV error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export comprehensive CSV'
    });
  }
};
exports.exportPDFReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportType } = req.query;
    const PDFDocument = require('pdfkit');
    let csvHeader = '';
    let csvData = '';
    let title = '';
    switch (reportType) {
      case 'spending':
        title = 'Spending Analysis Report';
        const spendingTransactions = await Transaction.find({
          userId,
          type: 'Expense'
        }).populate('walletId', 'name type').sort({ date: -1 });
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = spendingTransactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const category = transaction.category || 'N/A';
          const amount = Math.abs(transaction.amount);
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${category}","${amount}","${wallet}","${description}"`;
        }).join('\n');
        break;
      case 'income':
        title = 'Income Analysis Report';
        const incomeTransactions = await Transaction.find({
          userId,
          type: 'Income'
        }).populate('walletId', 'name type').sort({ date: -1 });
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = incomeTransactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const category = transaction.category || 'N/A';
          const amount = transaction.amount;
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${category}","${amount}","${wallet}","${description}"`;
        }).join('\n');
        break;
      case 'budget':
        title = 'Budget Performance Report';
        const budgets = await Budget.find({ userId }).sort({ month: -1 });
        csvHeader = 'Month,Category,Budgeted,Spent,Remaining,Utilization\n';
        csvData = budgets.map(budget => {
          const utilization = budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0;
          return `"${budget.month}","${budget.category}","${budget.amount}","${budget.spent || 0}","${budget.amount - (budget.spent || 0)}","${utilization.toFixed(1)}%"`;
        }).join('\n');
        break;
      case 'savings':
        title = 'Savings Goals Report';
        const goals = await Goal.find({ userId });
        csvHeader = 'Title,Target Amount,Saved Amount,Remaining,Status,Deadline\n';
        csvData = goals.map(goal => {
          const remaining = goal.targetAmount - (goal.currentAmount || 0);
          return `"${goal.title}","${goal.targetAmount}","${goal.currentAmount || 0}","${remaining}","${goal.status}","${goal.deadline.toISOString().split('T')[0]}"`;
        }).join('\n');
        break;
      case 'cashflow':
        title = 'Cash Flow Analysis Report';
        const cashflowTransactions = await Transaction.find({ userId })
          .populate('walletId', 'name type').sort({ date: -1 });
        csvHeader = 'Date,Type,Amount,Category,Wallet,Description\n';
        csvData = cashflowTransactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const type = transaction.type;
          const amount = transaction.amount;
          const category = transaction.category || 'N/A';
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${type}","${amount}","${category}","${wallet}","${description}"`;
        }).join('\n');
        break;
      case 'category':
        title = 'Category Analysis Report';
        const categoryTransactions = await Transaction.find({
          userId,
          type: 'Expense'
        }).populate('walletId', 'name type').sort({ date: -1 });
        csvHeader = 'Date,Category,Amount,Wallet,Description\n';
        csvData = categoryTransactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const category = transaction.category || 'N/A';
          const amount = Math.abs(transaction.amount);
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${category}","${amount}","${wallet}","${description}"`;
        }).join('\n');
        break;
      default:
        title = 'Financial Report';
        const allTransactions = await Transaction.find({ userId })
          .populate('walletId', 'name type').sort({ date: -1 });
        csvHeader = 'Date,Type,Amount,Category,Wallet,Description\n';
        csvData = allTransactions.map(transaction => {
          const date = transaction.date.toISOString().split('T')[0];
          const type = transaction.type;
          const amount = transaction.amount;
          const category = transaction.category || 'N/A';
          const wallet = transaction.walletId ? transaction.walletId.name : 'N/A';
          const description = transaction.description || 'N/A';
          return `"${date}","${type}","${amount}","${category}","${wallet}","${description}"`;
        }).join('\n');
    }
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType || 'financial'}-report.pdf`);
      res.send(pdfData);
    });
    doc.fontSize(20).text(title, { align: 'center' });
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    if (reportType === 'spending' || reportType === 'income' || reportType === 'cashflow' || reportType === 'category') {
      const transactions = await Transaction.find({ userId, ...(reportType === 'spending' || reportType === 'category' ? { type: 'Expense' } : reportType === 'income' ? { type: 'Income' } : {}) });
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const avgAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
      doc.fontSize(10);
      doc.text(`Total Transactions: ${transactions.length}`);
      doc.text(`Total Amount: ₹${totalAmount.toLocaleString()}`);
      doc.text(`Average Amount: ₹${avgAmount.toFixed(2)}`);
    } else if (reportType === 'budget') {
      const budgets = await Budget.find({ userId });
      const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
      doc.fontSize(10);
      doc.text(`Total Budgets: ${budgets.length}`);
      doc.text(`Total Budgeted: ₹${totalBudgeted.toLocaleString()}`);
      doc.text(`Total Spent: ₹${totalSpent.toLocaleString()}`);
      doc.text(`Overall Utilization: ${totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : 0}%`);
    } else if (reportType === 'savings') {
      const goals = await Goal.find({ userId });
      const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
      const completedGoals = goals.filter(g => (g.currentAmount || 0) >= g.targetAmount).length;
      doc.fontSize(10);
      doc.text(`Total Goals: ${goals.length}`);
      doc.text(`Completed Goals: ${completedGoals}`);
      doc.text(`Total Target: ₹${totalTarget.toLocaleString()}`);
      doc.text(`Total Saved: ₹${totalSaved.toLocaleString()}`);
      doc.text(`Overall Progress: ${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%`);
    }
    doc.moveDown(1);
    doc.fontSize(14).text('Data Export', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(8);
    const lines = csvData.split('\n');
    const headerLine = lines[0];
    const dataLines = lines.slice(1);
    doc.font('Helvetica-Bold');
    headerLine.split(',').forEach((header, index) => {
      doc.text(header.replace(/"/g, ''), 50 + (index * 100), doc.y);
    });
    doc.moveDown(0.5);
    doc.font('Helvetica');
    dataLines.slice(0, 50).forEach((line, rowIndex) => {
      if (line.trim()) {
        line.split(',').forEach((cell, colIndex) => {
          doc.text(cell.replace(/"/g, ''), 50 + (colIndex * 100), doc.y);
        });
        doc.moveDown(0.3);
        if (doc.y > 700) {
          doc.addPage();
          doc.moveDown(1);
        }
      }
    });
    if (dataLines.length > 50) {
      doc.fontSize(10).text(`... and ${dataLines.length - 50} more rows`, { align: 'center' });
    }
    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export PDF report',
      error: error.message
    });
  }
};
exports.getReportSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [transactionStats, walletStats, budgetStats, goalStats, debtStats] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Wallet.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$type',
            totalBalance: { $sum: '$balance' },
            count: { $sum: 1 }
          }
        }
      ]),
      Budget.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalBudgeted: { $sum: '$budgetedAmount' },
            totalSpent: { $sum: '$spentAmount' },
            totalRemaining: { $sum: '$remainingAmount' }
          }
        }
      ]),
      Goal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalTarget: { $sum: '$targetAmount' },
            totalSaved: { $sum: '$savedAmount' }
          }
        }
      ]),
      Debt.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalRemaining: { $sum: '$remainingAmount' }
          }
        }
      ])
    ]);
    res.json({
      status: 'success',
      data: {
        transactions: transactionStats,
        wallets: walletStats,
        budgets: budgetStats[0] || { totalBudgeted: 0, totalSpent: 0, totalRemaining: 0 },
        goals: goalStats,
        debts: debtStats
      }
    });
  } catch (error) {
    console.error('Get report summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch report summary'
    });
  }
};
