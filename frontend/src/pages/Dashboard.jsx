import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, StatsCard, LoadingSpinner, Alert } from '../components/ui';
import useFinanceStore from '../stores/financeStore';
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import { IndianRupee, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  // Use Zustand store for state management
  const {
    transactions,
    budgets,
    isLoading,
    error,
    fetchTransactions,
    fetchBudgets,
    clearError,
    shouldRefresh,
    clearAllData,
  } = useFinanceStore();

  // Get user information from auth context
  const { user } = useAuth();

  // Memoized calculations for better performance
  const expensesByCategory = useMemo(() => {
    const expenses = {};
    transactions
      .filter((t) => t.type && t.type.toLowerCase() === "expense")
      .forEach((t) => {
        const categoryName = t.category?.name || t.category || "Uncategorized";
        expenses[categoryName] =
          Number(expenses[categoryName] || 0) + Number(t.amount || 0);
      });

    return Object.entries(expenses).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const budgetVsSpent = useMemo(() => {
    const spentByCategory = {};

    // Process all expense transactions
    transactions
      .filter(t => t.type && t.type.toLowerCase() === 'expense')
      .forEach(t => {
        const categoryName = t.category?.name || t.category || "Uncategorized";
        spentByCategory[categoryName] = (spentByCategory[categoryName] || 0) + Math.abs(Number(t.amount) || 0);
      });

    // Process budgets and merge with spent amounts
    const processedBudgets = budgets.map((b) => {
      const category = b.category || b.name || "Uncategorized";
      const budget = typeof b.budgeted === 'number' ? b.budgeted : parseFloat(b.budgeted) || 0;

      // Use spent amount from transactions if available, otherwise from budget data
      const spent = category in spentByCategory
        ? spentByCategory[category]
        : (typeof b.spent === 'number' ? b.spent : parseFloat(b.spent) || 0);

      return {
        name: category,
        budget: Math.max(0, budget),
        spent: Math.max(0, spent),
      };
    });

    // Also include categories that have spending but no budget
    Object.entries(spentByCategory).forEach(([category, spent]) => {
      if (!processedBudgets.some(b => b.name === category)) {
        processedBudgets.push({
          name: category,
          budget: 0,
          spent: Math.max(0, spent)
        });
      }
    });

    return processedBudgets;
  }, [budgets, transactions]);

  const incomeVsExpense = useMemo(() => {
    const dailyData = {};
    transactions.forEach((t) => {
      if (!t.type) return;
      const rawDate = t.date || t.createdAt;
      if (!rawDate) return;
      const date = new Date(rawDate).toISOString().split("T")[0];
      if (!dailyData[date]) dailyData[date] = { date, income: 0, expense: 0 };
      const type = t.type.toLowerCase();
      if (type === "income") dailyData[date].income += Number(t.amount || 0);
      if (type === "expense") dailyData[date].expense += Number(t.amount || 0);
    });

    return Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions]);

  // Calculate total income and expenses from transactions
  const { totalIncome, totalExpenses } = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (!t.type) return acc;

      // Normalize type and amount
      const type = String(t.type || '').toLowerCase().trim();
      const amount = Math.abs(Number(t.amount) || 0);

      if (type === 'income') {
        acc.totalIncome += amount;
      } else if (type === 'expense') {
        acc.totalExpenses += amount;
      }

      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0
    });
  }, [transactions]);

  // Calculate trend percentages based on current vs previous month data
  const { incomeTrend, expenseTrend } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date || t.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Get previous month transactions
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date || t.createdAt);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Calculate current month totals
    const currentIncome = currentMonthTransactions
      .filter(t => t.type?.toLowerCase() === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const currentExpenses = currentMonthTransactions
      .filter(t => t.type?.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    // Calculate previous month totals
    const prevIncome = prevMonthTransactions
      .filter(t => t.type?.toLowerCase() === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const prevExpenses = prevMonthTransactions
      .filter(t => t.type?.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    // Calculate trend percentages
    const incomeTrend = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseTrend = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    return {
      incomeTrend: Math.abs(incomeTrend).toFixed(1),
      expenseTrend: Math.abs(expenseTrend).toFixed(1)
    };
  }, [transactions]);

  const loadDashboardData = async () => {
    try {
      setIsAutoRefreshing(true);

      // First, try to fetch fresh data from backend
      const [transactionsResponse, budgetsResponse] = await Promise.all([
        fetchTransactions(),
        fetchBudgets()
      ]);

      // Check if backend returned empty data but we have cached data
      // This indicates the backend was reset and cache should be cleared
      const freshTransactions = transactionsResponse || [];
      const freshBudgets = budgetsResponse || [];

      if ((freshTransactions.length === 0 && transactions.length > 0) ||
        (freshBudgets.length === 0 && budgets.length > 0)) {
        console.log('Backend data cleared, clearing cache...');
        clearAllData();
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsAutoRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await loadDashboardData();
  };

  // Auto-refresh dashboard data every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasData) {
        loadDashboardData();
      }
    }, 60000); // 60 seconds

    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, []); // Remove hasData dependency to prevent infinite re-renders

  // Fetch data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [fetchTransactions, fetchBudgets, shouldRefresh, transactions.length]);

  // Enhanced loading state with better UX
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="xl" variant="primary" text="Loading your financial data..." />
        </div>
      </div>
    );
  }

  // Check if we have data to display
  const hasTransactions = transactions.length > 0;
  const hasBudgets = budgets.length > 0;
  const hasData = hasTransactions || hasBudgets;

  // Real-time update state
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  if (error && !hasData) {
    return (
      <div className="min-h-screen flex justify-center items-center p-8">
        <Card className="max-w-lg w-full">
          <Alert type="error" title="Dashboard Unavailable">
            <p className="mb-4">
              Your dashboard needs transaction and budget data to display properly.
              Since you've cleared your data, let's help you get started again!
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Add some transactions (income/expenses)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Create budgets for expense categories</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Set up financial goals</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  clearError();
                  fetchTransactions();
                  fetchBudgets();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry Loading
              </button>
              <Link
                to="/transactions"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Transactions
              </Link>
            </div>
          </Alert>
        </Card>
      </div>
    );
  }

  // Show helpful empty state when no data exists
  if (!hasData) {
    return (
      <div className="min-h-screen flex justify-center items-center p-8">
        <Card className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="text-8xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Your Financial Dashboard!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Your dashboard is ready to display your financial insights, but it needs some data to work with.
              Let's get you started with tracking your finances.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start by recording your income and expenses
              </p>
              <Link
                to="/transactions"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Go to Transactions
              </Link>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create Budgets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set spending limits for different categories
              </p>
              <Link
                to="/budgets"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Go to Budgets
              </Link>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Set Goals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Define your financial targets and milestones
              </p>
              <Link
                to="/goals"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Go to Goals
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: Start with adding a few transactions and watch your dashboard come to life!
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header */}
      <div className="text-center py-8 px-4">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'User'}!
            </span>
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
          Here's your financial overview for today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="This Month's Income"
          value={totalIncome}
          icon={<IndianRupee className="w-6 h-6" />}
          variant="success"
          trend="up"
          trendValue={incomeTrend}
        />

        <StatsCard
          title="This Month's Expenses"
          value={totalExpenses}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="error"
          trend="down"
          trendValue={expenseTrend}
        />
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Expenses by Category - Enhanced Donut Chart */}
        <Card variant="gradient" hover="glow" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full transform translate-x-16 -translate-y-16 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-float3D">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                    Expenses by Category
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Breakdown of your spending</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {expensesByCategory.length > 0 ? 'Live Data' : 'No Data Yet'}
                </span>
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              {expensesByCategory.length > 0 ? (
                <DonutChart data={expensesByCategory} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-sm">No expense data to display</p>
                    <p className="text-xs mt-1">Add some expense transactions to see this chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Budget vs Spent - Enhanced Bar Chart */}
        <Card variant="gradient" hover="glow" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full transform -translate-x-14 -translate-y-14 animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full transform translate-x-10 translate-y-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-float3D" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Budget vs Spent
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your budget performance</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {budgetVsSpent.length > 0 ? 'Updated' : 'No Data Yet'}
                </span>
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              {budgetVsSpent.length > 0 ? (
                <BarChart data={budgetVsSpent} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📈</div>
                    <p className="text-sm">No budget data to display</p>
                    <p className="text-xs mt-1">Create budgets to see budget vs spending analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Income vs Expense Trend - Enhanced Line Chart */}
      <Card variant="gradient" hover="glow" className="relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-40 h-40 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full transform -translate-x-20 -translate-y-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-200/15 to-emerald-200/15 rounded-full transform translate-y-16 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-200/15 to-cyan-200/15 rounded-full transform translate-x-12 translate-y-12 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-float3D" style={{ animationDelay: '1s' }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  Income vs Expense Trend
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your financial flow over time</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-md animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-md animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expense</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {incomeVsExpense.length > 0 ? 'Real-time' : 'No Data Yet'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
            {incomeVsExpense.length > 0 ? (
              <LineChart data={incomeVsExpense} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-3">📈</div>
                  <p className="text-sm">No trend data to display</p>
                  <p className="text-xs mt-1">Add transactions to see income vs expense trends over time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
