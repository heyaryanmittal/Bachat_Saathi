import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, StatsCard, LoadingSpinner } from '../components/ui';
import useFinanceStore from '../stores/financeStore';
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import { 
  IndianRupee, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  Layers, 
  ArrowUpRight, 
  Lightbulb, 
  Target, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
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
  const hasData = transactions.length > 0 || budgets.length > 0;
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="xl" variant="primary" text="Preparing your financial landscape..." />
      </div>
    );
  }
  if (!hasData) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col justify-center animate-entrance selection:bg-primary/20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white leading-tight">
            Your <span className="text-primary italic">Financial Legacy</span> <br />
            Starts Right Here
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed font-medium">
            Welcome, {user?.name || 'Saver'}. Start tracking your earnings and spending to unlock powerful AI insights and build wealth.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <Link to="/transactions" className="group relative p-6 rounded-[2rem] bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 text-left overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-all">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-black text-xl mb-1 text-slate-900 dark:text-white tracking-tight">Record Transaction</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-70">Log income or expense</p>
            </Link>
            <Link to="/budgets" className="group relative p-6 rounded-[2rem] bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 text-left overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 transition-all">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="font-black text-xl mb-1 text-slate-900 dark:text-white tracking-tight">Set Spending Goals</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-70">Plan your monthly limits</p>
            </Link>
          </div>
          <div className="max-w-xl mx-auto py-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">10k+</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">₹1.2Cr</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saved Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white">4.9/5</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rating</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-entrance pb-6 overflow-x-hidden">
      {}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-black/20">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Howdy, <span className="text-primary italic">{user?.name || 'Saver'}!</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
              Wealth Score: 782
            </span>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex flex-col items-end pr-4 border-r border-slate-200 dark:border-slate-800 hidden sm:flex text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Surplus</span>
            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
              ₹{(totalIncome - totalExpenses).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <Button onClick={() => fetchTransactions()} variant="secondary" className="px-4 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest">
               Sync
            </Button>
            <Link to="/transactions" className="flex-1 lg:flex-none">
              <Button className="btn-saas-primary w-full px-6 h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">
                New Entry
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Current Earnings"
          value={totalIncome}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
          trendValue={incomeTrend}
          variant="success"
        />
        <StatsCard
          title="Current Outflow"
          value={totalExpenses}
          icon={<TrendingDown className="w-6 h-6" />}
          trend={Number(expenseTrend) > 0 ? "up" : "down"}
          trendValue={Math.abs(expenseTrend)}
          variant="error"
        />
        <StatsCard
          title="Potential Savings"
          value={totalIncome - totalExpenses}
          icon={<IndianRupee className="w-6 h-6" />}
          variant="gradient"
        />
      </div>
      {}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <Card size="md" className="xl:col-span-1 saas-card relative overflow-hidden group">
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Expense Mix</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribution</p>
            </div>
          </div>
          <div className="h-[250px] relative z-10">
            {expensesByCategory.length > 0 ? (
              <DonutChart data={expensesByCategory} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <Layers className="w-8 h-8 text-slate-200" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No data</p>
              </div>
            )}
          </div>
        </Card>
        <Card size="md" className="xl:col-span-2 saas-card group overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Flow Velocity</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trajectory</p>
              </div>
            </div>
          </div>
          <div className="h-[250px]">
            {incomeVsExpenseTrend.length > 0 ? (
              <LineChart data={incomeVsExpenseTrend} />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Initializing...</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      {}
      <Card size="md" className="saas-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Active Allocation</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budgeting</p>
            </div>
          </div>
          <Link to="/budgets">
            <Button variant="outline" className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Manage
            </Button>
          </Link>
        </div>
        <div className="h-[220px]">
            {budgetVsSpent.length > 0 ? (
              <BarChart data={budgetVsSpent} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No active budgets</p>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}
export default Dashboard;
