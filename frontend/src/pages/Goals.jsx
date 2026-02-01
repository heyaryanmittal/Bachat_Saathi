import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { format } from 'date-fns';
import {
  Target,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Trash2,
  X,
  Plus,
  Plane,
  Car,
  Home,
  GraduationCap
} from 'lucide-react';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'other'
  });

  const [savingsAmount, setSavingsAmount] = useState('');

  useEffect(() => {
    fetchGoals();
    fetchGoalStats();
    
    // Set up polling to refresh stats every 30 seconds
    const intervalId = setInterval(() => {
      fetchGoalStats();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const calculateGoalProgress = (goal) => {
    const saved = parseFloat(goal.savedAmount) || 0;
    const target = parseFloat(goal.targetAmount) || 1; // Avoid division by zero
    const remaining = Math.max(0, target - saved);
    const progressPercentage = Math.min((saved / target) * 100, 100);
    
    return {
      ...goal,
      savedAmount: saved,
      targetAmount: target,
      remainingAmount: remaining,
      progressPercentage: progressPercentage,
      status: progressPercentage >= 100 ? 'completed' : goal.status || 'in-progress'
    };
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGoals({ limit: 100 });
      
      // Process goals to include calculated fields
      const processedGoals = response.data.data.map(goal => calculateGoalProgress(goal));
      
      setGoals(processedGoals);
      setError('');
    } catch (err) {
      console.error('Fetch goals error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching goals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoalStats = async () => {
    try {
      const response = await api.getGoalStats();
      const statsData = response.data.data;
      
      // Calculate success rate based on completed vs total goals
      const successRate = statsData.totalGoals > 0 
        ? Math.round((statsData.completedGoals / statsData.totalGoals) * 100) 
        : 0;
      
      setStats({
        ...statsData,
        successRate
      });
    } catch (err) {
      console.error('Fetch goal stats error:', err.response?.data || err.message);
      // Set default values to prevent UI errors
      setStats({
        totalGoals: 0,
        completedGoals: 0,
        inProgressGoals: 0,
        totalTargetAmount: 0,
        totalSavedAmount: 0,
        successRate: 0,
        overdueGoals: 0
      });
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.createGoal(newGoal);
      setShowCreateModal(false);
      setNewGoal({
        title: '',
        description: '',
        targetAmount: '',
        deadline: '',
        category: 'other'
      });
      setSuccessMessage('Goal created successfully!');
      fetchGoals();
      fetchGoalStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Create goal error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error creating goal');
    }
  };

  // Add fetchGoalStats to the dependency array of this effect
  useEffect(() => {
    fetchGoalStats();
  }, [goals]);

  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !savingsAmount) return;

    try {
      const amount = parseFloat(savingsAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      await api.addSavingsToGoal(selectedGoal._id, { amount });
      setShowSavingsModal(false);
      setSavingsAmount('');
      setSelectedGoal(null);
      setSuccessMessage('Savings added successfully!');
      
      // Refresh the goals to get updated data
      await fetchGoals();
      await fetchGoalStats();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Add savings error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error adding savings');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleDeleteClick = (goalId) => {
    setGoalToDelete(goalId);
    setShowDeleteModal(true);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    try {
      const response = await api.deleteGoal(goalToDelete);
      if (response.status === 200) {
        setSuccessMessage('Goal deleted successfully!');
        await fetchGoals();
        await fetchGoalStats();
      }
    } catch (err) {
      console.error('Delete goal error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error deleting goal');
    } finally {
      setShowDeleteModal(false);
      setGoalToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return goal.status === 'in-progress';
    if (activeTab === 'completed') return goal.status === 'completed';
    return true;
  });

  const formatCurrency = (amount) => {
    // Convert to number and handle NaN/undefined/null cases
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(0);
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      emergency: AlertTriangle,
      vacation: Plane,
      car: Car,
      house: Home,
      education: GraduationCap,
      investment: TrendingUp,
      other: Target
    };
    const IconComponent = icons[category] || icons.other;
    return <IconComponent className="w-6 h-6 text-white" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Saving Goals
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set financial targets, track your progress, and achieve your dreams
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <Target className="w-5 h-5" />
          Create New Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGoals || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedGoals || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Saved</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalSavedAmount ? formatCurrency(stats.totalSavedAmount) : '₹0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.successRate !== undefined ? `${stats.successRate}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {['all', 'in-progress', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Goals' :
             tab === 'in-progress' ? 'In Progress' :
             'Completed'}
          </button>
        ))}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No goals yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first saving goal to start tracking your progress
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredGoals.map((goal) => (
            <div
              key={goal._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">{getCategoryIcon(goal.category)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)} • Due {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    goal.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(goal._id);
                    }}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors transform hover:scale-110 transition-transform duration-200"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {goal.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {typeof goal.progressPercentage === 'number' && !isNaN(goal.progressPercentage) 
                      ? Math.round(goal.progressPercentage) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(goal.progressPercentage || 0)}`}
                    style={{ width: `${Math.min(goal.progressPercentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Target Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Saved Amount</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(goal.savedAmount)}
                  </p>
                </div>
              </div>

              {/* Remaining Amount */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Remaining</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatCurrency(goal.remainingAmount)}
                  </p>
                </div>
                {goal.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowSavingsModal(true);
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Savings
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Goal
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount *
                </label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="100000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="emergency">Emergency Fund</option>
                  <option value="vacation">Vacation</option>
                  <option value="car">Car Purchase</option>
                  <option value="house">House Down Payment</option>
                  <option value="education">Education</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showSavingsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Savings
              </h2>
              <button
                onClick={() => {
                  setShowSavingsModal(false);
                  setSelectedGoal(null);
                  setSavingsAmount('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {selectedGoal.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Current: {formatCurrency(selectedGoal.savedAmount)} / {formatCurrency(selectedGoal.targetAmount)}
              </p>
            </div>

            <form onSubmit={handleAddSavings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Add *
                </label>
                <input
                  type="number"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="5000"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSavingsModal(false);
                    setSelectedGoal(null);
                    setSavingsAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Add Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Delete Goal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this goal? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGoal}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 hover:shadow-red-500/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
