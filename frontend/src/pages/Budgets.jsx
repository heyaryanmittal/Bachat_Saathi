import { useState, useEffect } from "react";
import * as api from "../services/api";
import BudgetForm from "../components/BudgetForm";
import {
  Calendar,
  Target,
  Edit3,
  ClipboardList,
  FolderOpen,
  TrendingUp,
  DollarSign,
  TrendingDown,
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    budgetId: null,
    category: "",
    isDeleting: false
  });

  useEffect(() => {
    fetchBudgets();
  }, [currentMonth]);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const [year, month] = currentMonth.split("-").map(Number);

      // Get only this month's transactions and budgets
      const [budgetsResponse, transactionsResponse] = await Promise.all([
        api.getBudgets({ month, year }),
        api.getTransactions({ month, year }),
      ]);

      const budgetsList = budgetsResponse.data.data?.budgets || [];
      const transactions = transactionsResponse.data.data?.transactions || [];

      // Only show categories that have budgets created by user
      const completeSummary = budgetsList.map((budget) => {
        const categoryTransactions = transactions.filter(
          (t) =>
            t.category === budget.category &&
            t.type.toLowerCase() === "expense" &&
            new Date(t.date).getMonth() + 1 === month
        );

        const spent = categoryTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );

        return {
          category: budget.category,
          budgeted: Number(budget.amount),
          spent: spent,
          _id: budget._id, // Keep the budget ID for delete functionality
        };
      });

      setBudgets(budgetsList);
      setSummary(completeSummary);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching budgets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    console.log('Editing budget:', budget); // Debug: Check budget structure

    // Ensure all required fields are properly mapped for the form
    const formData = {
      category: budget.category || '',
      amount: budget.amount || 0,
      alertThreshold: (budget.alertThreshold || 0.8) * 100, // Convert fraction to percentage
      monthYear: `${budget.year}-${String(budget.month).padStart(2, '0')}`,
      year: budget.year,
      month: budget.month
    };

    console.log('Form data mapping:', formData); // Debug: Check form data mapping

    setEditingBudget({
      ...budget,
      ...formData // Override with form-compatible data
    });
    setIsEditing(true);
  };

  const handleCreateBudget = async (data) => {
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      await api.createBudget({ ...data, month, year });
      setIsCreating(false);
      await fetchBudgets();
      setInfoMessage('Budget created successfully!');
      setTimeout(() => setInfoMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating budget');
    }
  };

  const handleUpdateBudget = async (data) => {
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      await api.updateBudget(editingBudget._id, { ...data, month, year });
      setIsEditing(false);
      setEditingBudget(null);
      await fetchBudgets();
      setInfoMessage('Budget updated successfully!');
      setTimeout(() => setInfoMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating budget');
    }
  };

  const handleDeleteBudget = (id, category) => {
    setDeleteDialog({
      isOpen: true,
      budgetId: id,
      category: category,
      isDeleting: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.budgetId) return;
    
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      
      await api.deleteBudget(deleteDialog.budgetId);
      await fetchBudgets();
      
      setInfoMessage('Budget deleted successfully!');
      setTimeout(() => setInfoMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting budget');
    } finally {
      setDeleteDialog({
        isOpen: false,
        budgetId: null,
        category: "",
        isDeleting: false
      });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      budgetId: null,
      category: "",
      isDeleting: false
    });
  };

  const formatAmount = (amount) => {
    // Ensure amount is a valid number
    const num = Number(amount);
    return Number.isFinite(num)
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(num)
      : "₹0";
  };

  const calculateBudgetProgress = (budget, spent) => {
    const budgetAmount = Number(budget.amount);
    const spentAmount = Number(spent);
    const remaining = budgetAmount - spentAmount;
    const progress =
      budgetAmount > 0
        ? Math.min((spentAmount / budgetAmount) * 100, 100)
        : 0;

    return {
      remaining: remaining,
      progress: progress.toFixed(1),
    };
  };

  if (isLoading && !budgets.length) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  const totalBudgeted = summary.reduce((sum, item) => sum + Number(item.budgeted), 0);
  const totalSpent = summary.reduce((sum, item) => sum + Number(item.spent), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header Section */}
      <div className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Budget Management
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Plan and track your monthly spending goals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Budgeted */}
        <div className="card-modern card-hover p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Budgeted</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatAmount(totalBudgeted)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="card-modern card-hover p-6 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatAmount(totalSpent)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className={`card-modern card-hover p-6 bg-gradient-to-br ${totalRemaining >= 0 ? 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' : 'from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Remaining Budget</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {formatAmount(totalRemaining)}
              </p>
            </div>
            <div className={`w-12 h-12 ${totalRemaining >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-xl flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={totalRemaining >= 0 ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {summary.length} budget{summary.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Budget</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 animate-fadeInUp">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 animate-fadeInUp">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{infoMessage}</p>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="card-modern p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Period</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select the month to view budgets</p>
            </div>
          </div>
          <div>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="input-modern w-48"
            />
          </div>
        </div>
      </div>

      {/* Create Budget Form */}
      {isCreating && (
        <div className="card-modern p-8 mb-8 animate-fadeInUp">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Budget
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Set spending limits for your categories
            </p>
          </div>
          <BudgetForm onSubmit={handleCreateBudget} />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsCreating(false)}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Budget Form */}
      {isEditing && editingBudget && (
        <div className="card-modern p-8 mb-8 animate-fadeInUp">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Budget
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Update your budget amount and category
            </p>
          </div>
          <BudgetForm onSubmit={handleUpdateBudget} initialData={editingBudget} />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingBudget(null);
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Budgets Table */}
      <div className="card-modern overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            Budget Overview
          </h3>
        </div>
        
        {summary.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first budget to start tracking expenses</p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary"
            >
              Create Budget
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Budgeted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {summary.map((item) => {
                  const budgeted = Number(item.budgeted) || 0;
                  const spent = Number(item.spent) || 0;
                  const { remaining, progress } = calculateBudgetProgress(
                    budgets.find((b) => b.category === item.category),
                    spent
                  );

                  return (
                    <tr key={item.category} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatAmount(budgeted)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {formatAmount(spent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatAmount(remaining)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  progress >= 100
                                    ? "bg-gradient-to-r from-red-500 to-red-600"
                                    : progress >= 80
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                    : "bg-gradient-to-r from-green-400 to-green-600"
                                }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium min-w-[3rem] text-right ${
                            progress >= 100 ? 'text-red-600 dark:text-red-400' :
                            progress >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditBudget(
                              budgets.find((b) => b.category === item.category)
                            )}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors duration-200 group"
                          >
                            <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="group-hover:scale-105 transition-transform">Edit</span>
                          </button>
                          {budgets.find((b) => b.category === item.category) && (
                            <button
                              onClick={() => handleDeleteBudget(
                                budgets.find((b) => b.category === item.category)._id,
                                item.category
                              )}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors duration-200 group"
                            >
                              <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="group-hover:scale-105 transition-transform">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6 text-center">
              {/* Animated Trash Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-40 transition-opacity duration-300 animate-ping"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Budget</h3>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete the budget for
                </p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1">
                  {deleteDialog.category}?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This will remove all tracking for this category's budget.
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. Are you sure you want to continue?
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelDelete}
                  disabled={deleteDialog.isDeleting}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteDialog.isDeleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                >
                  {deleteDialog.isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Budget'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
