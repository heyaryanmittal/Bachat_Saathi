import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

function PointsInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

    if (user) {
      fetchUsageStats();
    }
  }, [user]);

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Points System, Policies & Analytics</h1>
            
            <div className="space-y-10">
              {/* Usage Analytics Section - First */}
              <div>
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  📊 Your Usage Analytics
                </h2>
                {loading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <p>Loading statistics...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Days Active</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{usageStats.daysActive || 0}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Transactions</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{usageStats.totalTransactions || 0}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Active Budgets</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{usageStats.totalBudgets || 0}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Active Debts</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{usageStats.totalDebts || 0}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Savings Goals</p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{usageStats.totalGoals || 0}</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Wallets</p>
                      <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{usageStats.totalWallets || 0}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Website Usage Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  💡 Website Usage Tips
                </h2>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Log in regularly</strong> to maintain your login streak and earn bonus points</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Track all transactions</strong> to get accurate spending insights and financial analytics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Set and monitor budgets</strong> to stay on top of your spending habits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Create savings goals</strong> to motivate yourself and track progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Review leaderboard ranking</strong> to see how you compare with other users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Check monthly reports</strong> to understand your financial trends and patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Use the wallet feature</strong> to organize and manage multiple accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <span><strong>Enable recurring transactions</strong> for automated bill and savings tracking</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  🎯 How to Earn Points
                </h2>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Complete your profile:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+100 points</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Add first transaction:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+50 points</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Maintain budget for a week:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+200 points</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Pay off a debt:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+150 points</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Reach a savings goal:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+300 points</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">7-day login streak:</span> 
                      <span className="ml-2 text-gray-500 dark:text-gray-400">+100 points</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  🏆 Points Tiers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { tier: 'Bronze', points: '0-999', color: 'from-amber-600 to-amber-700' },
                    { tier: 'Silver', points: '1,000-4,999', color: 'from-gray-400 to-gray-500' },
                    { tier: 'Gold', points: '5,000-9,999', color: 'from-yellow-400 to-yellow-500' },
                    { tier: 'Platinum', points: '10,000+', color: 'from-purple-500 to-pink-500' }
                  ].map((item) => (
                    <div key={item.tier} className={`bg-gradient-to-r ${item.color} rounded-lg p-6 text-white`}>
                      <h3 className="text-xl font-bold mb-1">{item.tier}</h3>
                      <p className="text-sm opacity-90">{item.points} points</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                <h2 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mb-3">
                  📝 Debt Deletion Policy
                </h2>
                <ul className="space-y-2 text-yellow-700 dark:text-yellow-300">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Debts marked as "Paid" will be archived automatically after 30 days
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    You can't manually delete unpaid debts at any time
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Deleting a debt will remove it from all reports and statistics
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    Points earned from paying off a debt will not be revoked if the debt is later deleted
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    We recommend exporting your debt history before deleting if you need to keep records
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r">
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-3">
                  🗑️ Wallet Deletion Policy
                </h2>
                <ul className="space-y-2 text-red-700 dark:text-red-300">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    You can delete wallets only when they have a zero balance
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Deleting a wallet will remove all associated transactions and history
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Wallets deleted are permanent and cannot be recovered
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    All budgets and goals linked to the wallet will be affected
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    We recommend exporting your wallet data before deletion for record keeping
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Primary or default wallets require special handling before deletion
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointsInfoPage;
