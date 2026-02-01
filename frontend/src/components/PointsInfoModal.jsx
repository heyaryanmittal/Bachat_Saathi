import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

function PointsInfoModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('usage');
  const [usageStats, setUsageStats] = useState({
    totalTransactions: 0,
    totalBudgets: 0,
    totalDebts: 0,
    totalGoals: 0,
    totalWallets: 0,
    daysActive: 0,
    lastLogin: null,
    joinedDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchUsageStats();
    }
  }, [isOpen, user]);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/usage-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status === 'success') {
        setUsageStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-20 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-8 relative z-[9999] mx-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Points System, Policies & Usage Analytics
              </h3>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  onClick={() => setActiveTab('points')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'points'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Points & Tiers
                </button>
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'policies'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Policies
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'usage'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Usage Analytics
                </button>
              </div>
              
              <div className="mt-2 space-y-6">
                {/* Points Tab */}
                {activeTab === 'points' && (
                  <>
                    <div>
                      <h4 className="text-md font-medium text-blue-600 dark:text-blue-400 mb-2">🎯 How to Earn Points</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Complete your profile: <span className="font-medium">+100 points</span></li>
                        <li>Add first transaction: <span className="font-medium">+50 points</span></li>
                        <li>Maintain budget for a week: <span className="font-medium">+200 points</span></li>
                        <li>Pay off a debt: <span className="font-medium">+150 points</span></li>
                        <li>Reach a savings goal: <span className="font-medium">+300 points</span></li>
                        <li>7-day login streak: <span className="font-medium">+100 points</span></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-blue-600 dark:text-blue-400 mb-2">🏆 Points Tiers</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li><span className="font-medium">🥉 Bronze:</span> 0-999 points</li>
                        <li><span className="font-medium">🥈 Silver:</span> 1,000-4,999 points</li>
                        <li><span className="font-medium">🥇 Gold:</span> 5,000-9,999 points</li>
                        <li><span className="font-medium">💎 Platinum:</span> 10,000+ points</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Policies Tab */}
                {activeTab === 'policies' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-md font-medium text-red-600 dark:text-red-400 mb-2">📝 Debt Deletion Policy</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                      <li>Debts marked as "Paid" will be archived automatically after 30 days</li>
                      <li>You can manually delete unpaid debts at any time</li>
                      <li>Deleting a debt will remove it from all reports and statistics</li>
                      <li>Points earned from paying off a debt will not be revoked if the debt is later deleted</li>
                      <li>We recommend exporting your debt history before deleting if you need to keep records</li>
                    </ul>
                  </div>
                )}

                {/* Usage Analytics Tab */}
                {activeTab === 'usage' && (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <p>Loading statistics...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Days Active</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usageStats.daysActive || 0}</p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Transactions</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{usageStats.totalTransactions || 0}</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Active Budgets</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{usageStats.totalBudgets || 0}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Active Debts</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{usageStats.totalDebts || 0}</p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Savings Goals</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{usageStats.totalGoals || 0}</p>
                          </div>
                          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-200 dark:border-cyan-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Wallets</p>
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{usageStats.totalWallets || 0}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">📊 Website Usage Tips</h4>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                            <li>Log in regularly to maintain your login streak and earn bonus points</li>
                            <li>Track all transactions to get accurate spending insights and financial analytics</li>
                            <li>Set and monitor budgets to stay on top of your spending habits</li>
                            <li>Create savings goals to motivate yourself and track progress</li>
                            <li>Review your leaderboard ranking to see how you compare with other users</li>
                            <li>Check monthly reports to understand your financial trends and patterns</li>
                            <li>Use the wallet feature to organize and manage multiple accounts</li>
                            <li>Enable recurring transactions for automated bill and savings tracking</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={onClose}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointsInfoModal;
