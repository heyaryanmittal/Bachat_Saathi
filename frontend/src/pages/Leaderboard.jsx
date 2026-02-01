import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Trophy,
  Medal,
  TrendingUp,
  Star,
  Crown,
  Users,
  Zap,
  Target,
  Flame,
  Award,
  TrendingDown,
  ArrowUp
} from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('monthly');
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState([]);
  const [lifetimeLeaderboard, setLifetimeLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch monthly leaderboard
      const monthlyRes = await api.get('/leaderboard/monthly?limit=10');
      setMonthlyLeaderboard(monthlyRes.data.data);

      // Fetch lifetime leaderboard
      const lifetimeRes = await api.get('/leaderboard/lifetime?limit=10');
      setLifetimeLeaderboard(lifetimeRes.data.data);

      // Fetch user stats
      const userStatsRes = await api.get('/leaderboard/user/stats');
      setUserStats(userStatsRes.data.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    if (badge === 'saver_king' || badge === 'saver_king_monthly') return '👑';
    if (badge === 'top_saver' || badge === 'top_saver_monthly') return '⭐';
    if (badge === 'smart_saver' || badge === 'smart_saver_monthly') return '✨';
    return '🏆';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-300 to-orange-600';
    return 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700';
  };

  const currentLeaderboard = activeTab === 'monthly' ? monthlyLeaderboard : lifetimeLeaderboard;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-6 animate-bounce-slow">
            <Trophy className="w-14 h-14 text-yellow-500 drop-shadow-lg" />
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                LEADERBOARD
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compete • Achieve • Thrive</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of savers climbing the ranks. Earn points through smart financial decisions and unlock exclusive badges!
          </p>
        </div>

        {/* Top 3 Podium Section */}
        {currentLeaderboard.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Silver - Rank 2 */}
              {currentLeaderboard[1] && (
                <div className="order-first md:order-2 transform md:scale-90 md:translate-y-8 opacity-75">
                  <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl p-6 text-white text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="text-5xl mb-3">🥈</div>
                    <div className="text-2xl font-black mb-2">#2</div>
                    <h3 className="text-xl font-bold mb-3 truncate">{currentLeaderboard[1].username}</h3>
                    <div className="text-3xl font-black mb-2">{currentLeaderboard[1][activeTab === 'monthly' ? 'monthlyPoints' : 'lifetimePoints']}</div>
                    <p className="text-sm text-gray-200">Points</p>
                    {currentLeaderboard[1].badges && currentLeaderboard[1].badges.length > 0 && (
                      <div className="mt-3 flex justify-center gap-1 flex-wrap">
                        {currentLeaderboard[1].badges.slice(0, 2).map((badge) => (
                          <span key={badge} className="text-xl">{getBadgeIcon(badge)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gold - Rank 1 */}
              {currentLeaderboard[0] && (
                <div className="order-first md:order-1">
                  <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-2xl transform md:scale-110 group">
                    <div className="absolute -top-10 -right-10 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">👑</div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4 animate-pulse">🥇</div>
                      <div className="text-3xl font-black mb-3 drop-shadow-lg">#1</div>
                      <h3 className="text-2xl font-black mb-4 drop-shadow-lg truncate">{currentLeaderboard[0].username}</h3>
                      <div className="text-5xl font-black mb-2 drop-shadow-lg">{currentLeaderboard[0][activeTab === 'monthly' ? 'monthlyPoints' : 'lifetimePoints']}</div>
                      <p className="text-lg text-yellow-100 font-semibold">Points</p>
                      {currentLeaderboard[0].badges && currentLeaderboard[0].badges.length > 0 && (
                        <div className="mt-4 flex justify-center gap-2 flex-wrap">
                          {currentLeaderboard[0].badges.map((badge) => (
                            <span key={badge} className="text-2xl">{getBadgeIcon(badge)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bronze - Rank 3 */}
              {currentLeaderboard[2] && (
                <div className="order-last md:order-3 transform md:scale-90 md:translate-y-8 opacity-75">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="text-5xl mb-3">🥉</div>
                    <div className="text-2xl font-black mb-2">#3</div>
                    <h3 className="text-xl font-bold mb-3 truncate">{currentLeaderboard[2].username}</h3>
                    <div className="text-3xl font-black mb-2">{currentLeaderboard[2][activeTab === 'monthly' ? 'monthlyPoints' : 'lifetimePoints']}</div>
                    <p className="text-sm text-orange-100">Points</p>
                    {currentLeaderboard[2].badges && currentLeaderboard[2].badges.length > 0 && (
                      <div className="mt-3 flex justify-center gap-1 flex-wrap">
                        {currentLeaderboard[2].badges.slice(0, 2).map((badge) => (
                          <span key={badge} className="text-xl">{getBadgeIcon(badge)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Stats Card */}
        {userStats && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -top-40 -right-40 text-9xl opacity-10">⭐</div>
              <div className="absolute -bottom-20 -left-20 text-9xl opacity-10">💰</div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                  <Flame className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-3xl font-black">YOUR PERFORMANCE</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Monthly Rank', value: `#${userStats.monthlyRank || '-'}`, icon: Zap, color: 'bg-blue-500' },
                    { label: 'Monthly Points', value: userStats.monthlyPoints, icon: Flame, color: 'bg-orange-500' },
                    { label: 'Lifetime Rank', value: `#${userStats.lifetimeRank || '-'}`, icon: Trophy, color: 'bg-purple-500' },
                    { label: 'Lifetime Points', value: userStats.lifetimePoints, icon: Star, color: 'bg-pink-500' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20 hover:bg-white/20 transition-all">
                      <div className="flex justify-center mb-2">
                        <stat.icon className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div className="text-3xl font-black mb-1">{stat.value}</div>
                      <p className="text-xs text-blue-100 font-semibold">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {userStats.badges && userStats.badges.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-sm font-bold text-blue-100 mb-3">YOUR BADGES</p>
                    <div className="flex flex-wrap gap-2">
                      {userStats.badges.map((badge) => (
                        <div key={badge} className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 flex items-center space-x-2 hover:bg-white/30 transition-all">
                          <span className="text-xl">{getBadgeIcon(badge)}</span>
                          <span className="text-xs font-semibold capitalize">{badge.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center space-x-2 ${
              activeTab === 'monthly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>This Month</span>
          </button>
          <button
            onClick={() => setActiveTab('lifetime')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center space-x-2 ${
              activeTab === 'lifetime'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>All Time</span>
          </button>
        </div>

        {/* Leaderboard Rows */}
        <div className="space-y-3 mb-12">
          {currentLeaderboard.length > 0 ? (
            currentLeaderboard.map((entry, index) => {
              const rank = index + 1;
              const medal = getRankMedal(rank);
              const pointsField = activeTab === 'monthly' ? 'monthlyPoints' : 'lifetimePoints';
              const points = entry[pointsField];
              const nextPoints = currentLeaderboard[index - 1]?.[pointsField] || points;
              const pointDifference = nextPoints - points;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={index}
                  className={`group relative rounded-2xl p-5 transition-all transform hover:scale-102 hover:shadow-xl ${
                    isTopThree
                      ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg'
                      : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Rank & User */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black">
                        {medal || <span className="text-2xl text-gray-600 dark:text-gray-300">#{rank}</span>}
                      </div>

                      {/* Username & Badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                            {entry.username}
                          </h3>
                          {entry.badges && entry.badges.length > 0 && (
                            <span className="flex-shrink-0 text-xl" title={entry.badges[0]}>
                              {getBadgeIcon(entry.badges[0])}
                            </span>
                          )}
                        </div>
                        {entry.badges && entry.badges.length > 0 && (
                          <div className="flex gap-1">
                            {entry.badges.slice(0, 3).map((badge) => (
                              <span
                                key={badge}
                                title={badge}
                                className="text-lg opacity-70 hover:opacity-100 transition-opacity"
                              >
                                {getBadgeIcon(badge)}
                              </span>
                            ))}
                            {entry.badges.length > 3 && (
                              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                +{entry.badges.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Points */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {points.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">points</p>
                      {rank > 1 && pointDifference > 0 && (
                        <div className="flex items-center justify-end space-x-1 mt-1 text-red-600 dark:text-red-400 text-xs font-semibold">
                          <TrendingDown className="w-3 h-3" />
                          <span>{pointDifference.toLocaleString()} away</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background accent */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">No leaderboard data available yet</p>
            </div>
          )}
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How to Earn Points */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">How to Earn Points</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '💰', label: 'Stay under budget', points: '+50 pts' },
                { icon: '🎯', label: 'Complete goals', points: '+100 pts' },
                { icon: '💵', label: 'Monthly savings (per ₹1000)', points: '+5 pts' },
                { icon: '🔗', label: 'Pay off debts (per ₹1000)', points: '+10 pts' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg hover:bg-white/100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">{item.label}</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-black text-sm">{item.points}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Achievement Badges</h3>
            </div>
            <div className="space-y-3">
              {[
                { emoji: '👑', label: 'Saver King', desc: 'Rank #1' },
                { emoji: '⭐', label: 'Top Saver', desc: 'Top 3' },
                { emoji: '✨', label: 'Smart Saver', desc: 'Top 10' }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg hover:bg-white/100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-3xl mt-1">{badge.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{badge.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to climb the leaderboard? Start saving and earning points today!
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
            Start Saving Now 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
