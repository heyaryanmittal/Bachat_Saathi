import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, StatsCard, LoadingSpinner } from '../components/ui';
import useFinanceStore from '../stores/financeStore';
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import { IndianRupee, TrendingDown, TrendingUp, PieChart, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';

function Dashboard() {
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

  const { user } = useAuth();
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Memoized data
  const { totalIncome, totalExpenses, incomeTrend, expenseTrend } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date || t.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date || t.createdAt);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    const calculateTotal = (txs, type) => txs
      .filter(t => String(t.type || '').toLowerCase().trim() === type)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const currentIncome = calculateTotal(currentMonthTransactions, 'income');
    const currentExpenses = calculateTotal(currentMonthTransactions, 'expense');
    const prevIncome = calculateTotal(prevMonthTransactions, 'income');
    const prevExpenses = calculateTotal(prevMonthTransactions, 'expense');

    const getTrend = (curr, prev) => prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    return {
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      incomeTrend: getTrend(currentIncome, prevIncome).toFixed(1),
      expenseTrend: getTrend(currentExpenses, prevExpenses).toFixed(1)
    };
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const expenses = {};
    transactions
      .filter((t) => String(t.type || '').toLowerCase().trim() === "expense")
      .forEach((t) => {
        const categoryName = t.category?.name || t.category || "Uncategorized";
        expenses[categoryName] = Number(expenses[categoryName] || 0) + Number(t.amount || 0);
      });
    return Object.entries(expenses).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const budgetVsSpent = useMemo(() => {
    const spentByCategory = {};
    transactions
      .filter(t => t.type?.toLowerCase().trim() === 'expense')
      .forEach(t => {
        const cat = t.category?.name || t.category || "Uncategorized";
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(Number(t.amount || 0));
      });

    return budgets.map(b => ({
      name: b.category || b.name,
      budget: Number(b.budgeted || 0),
      spent: spentByCategory[b.category || b.name] || Number(b.spent || 0)
    }));
  }, [budgets, transactions]);

  const incomeVsExpenseTrend = useMemo(() => {
    const daily = {};
    transactions.forEach(t => {
      if (!t.date && !t.createdAt) return;
      const d = new Date(t.date || t.createdAt).toISOString().split('T')[0];
      if (!daily[d]) daily[d] = { date: d, income: 0, expense: 0 };
      const type = t.type?.toLowerCase().trim();
      if (type === 'income') daily[d].income += Number(t.amount || 0);
      if (type === 'expense') daily[d].expense += Number(t.amount || 0);
    });
    return Object.values(daily).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  useEffect(() => {
    const loadData = async () => {
      setIsAutoRefreshing(true);
      await Promise.all([fetchTransactions(), fetchBudgets()]);
      setIsAutoRefreshing(false);
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [fetchTransactions, fetchBudgets, shouldRefresh]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="xl" variant="primary" text="Preparing your dashboard..." />
      </div>
    );
  }

  const hasData = transactions.length > 0 || budgets.length > 0;

  if (!hasData) {
    return (
      <div className="pt-20 pb-10">
        <Card variant="glass" size="xl" className="max-w-3xl mx-auto text-center animate-entrance">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
            <PieChart className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-gradient">Your Financial Cloud is Ready</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Welcome to BachatSaathi! Let's build your financial profile.
            Start by adding your first transaction or setting a budget.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <Link to="/transactions" className="saas-card p-8 group border-primary/20 hover:border-primary transition-all">
              <IndianRupee className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg mb-2">Track Spending</h4>
              <p className="text-sm text-muted-foreground">Record your first income or expense</p>
            </Link>
            <Link to="/budgets" className="saas-card p-8 group border-primary/20 hover:border-primary transition-all">
              <TrendingDown className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg mb-2">Build a Budget</h4>
              <p className="text-sm text-muted-foreground">Set category limits to stay on track</p>
            </Link>
          </div>
          <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">✨ 10,000+ users managed their wealth today!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-24 space-y-12 animate-entrance pb-12 overflow-x-hidden">
      {/* SaaS Dashboard Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            Insight <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg flex items-center space-x-2">
            <span>Welcome, {user?.name || 'Saver'}</span>
            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span>
            <span>Monthly Overview</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-6 bg-muted/30 p-4 rounded-3xl border border-border/50">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Available Funds</p>
            <p className="text-2xl font-black text-foreground">₹{(totalIncome - totalExpenses).toLocaleString('en-IN')}</p>
          </div>
          <div className="w-px h-10 bg-border/50 hidden sm:block mx-2"></div>
          <div className="flex space-x-3">
            <Button onClick={() => fetchTransactions()} variant="secondary" size="md" loading={isAutoRefreshing}>
              Sync
            </Button>
            <Link to="/transactions">
              <Button size="md" className="btn-saas-primary">New Entry</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        <StatsCard
          title="Income this Month"
          value={totalIncome}
          icon={<TrendingUp className="w-7 h-7" />}
          trend="up"
          trendValue={incomeTrend}
          variant="success"
        />
        <StatsCard
          title="Expenses this Month"
          value={totalExpenses}
          icon={<TrendingDown className="w-7 h-7" />}
          trend={Number(expenseTrend) > 0 ? "up" : "down"}
          trendValue={Math.abs(expenseTrend)}
          variant="error"
        />
        <StatsCard
          title="Net Savings"
          value={totalIncome - totalExpenses}
          icon={<IndianRupee className="w-7 h-7" />}
          variant="gradient"
        />
      </div>

      {/* Analytics Core */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch px-4">
        <Card size="lg" className="xl:col-span-1 saas-card">
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-3 gradient-primary rounded-2xl text-white shadow-lg shadow-primary/20">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Spending Mix</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category Distribution</p>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            {expensesByCategory.length > 0 ? (
              <DonutChart data={expensesByCategory} />
            ) : (
              <p className="text-muted-foreground text-sm font-medium">No spending data</p>
            )}
          </div>
        </Card>

        <Card size="lg" className="xl:col-span-2 saas-card">
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black tracking-tight">Financial Flow</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Real-time Trends</p>
            </div>
          </div>
          <div className="h-[320px]">
            {incomeVsExpenseTrend.length > 0 ? (
              <LineChart data={incomeVsExpenseTrend} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                 <p className="text-muted-foreground text-sm font-bold">Trend data processing...</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Budgets Snapshot */}
      <div className="px-4">
        <Card size="lg" className="saas-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                 <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Budget Tracking</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actual vs Forecast</p>
              </div>
            </div>
            <Link to="/budgets">
              <Button variant="secondary" size="sm" className="font-black text-[10px] uppercase tracking-widest">
                Manage All →
              </Button>
            </Link>
          </div>
          <div className="h-[300px]">
             {budgetVsSpent.length > 0 ? (
               <BarChart data={budgetVsSpent} />
             ) : (
               <div className="flex h-full items-center justify-center">
                 <p className="text-muted-foreground font-medium italic">No active budgets found.</p>
               </div>
             )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
