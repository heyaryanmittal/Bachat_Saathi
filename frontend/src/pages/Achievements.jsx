import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// 3D Card Component for badge details
const BadgeCard3D = ({ badge, onClose }) => {
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 }
  }));

  const transform = (x, y, s) => 
    `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <animated.div
        className="relative w-full max-w-md"
        onMouseMove={({ clientX: x, clientY: y }) => {
          const rect = event.currentTarget.getBoundingClientRect();
          set({ xys: [(y - rect.top - rect.height / 2) / 20, (rect.left + rect.width / 2 - x) / 20, 1.05] });
        }}
        onMouseLeave={() => set({ xys: [0, 0, 1] })}
        style={{
          transform: props.xys.interpolate(transform),
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-br ${badge.color} p-8 rounded-2xl shadow-2xl text-center`}>
          <div className="text-8xl mb-6">
            {badge.icon}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{badge.name}</h3>
          <p className="text-white/90 mb-6">{badge.description}</p>
          <div className="text-2xl font-bold text-white/80">
            {badge.points ? `${badge.points.toLocaleString()} Points` : ''}
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </animated.div>
    </div>
  );
};
// Achievement Card Component
const AchievementCard = ({ achievement, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => onClick(achievement)}
    >
      <div className="flex items-start space-x-4 group">
        <div className={`p-3 rounded-lg transition-all duration-300 ${
          achievement.earned 
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 transform group-hover:scale-110 shadow-lg'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
        }`}>
          <span className="text-2xl">{achievement.icon || '🏆'}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold ${
              achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {achievement.name}
            </h3>
            <div className="flex items-center space-x-2">
              {achievement.earned ? (
                <>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Earned
                  </span>
                  {achievement.points > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                      +{achievement.points} pts
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-400">
                  Locked
                </span>
              )}
            </div>
          </div>
          <p className={`text-sm mt-1 ${
            achievement.earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'
          }`}>
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Badge Card Component
const BadgeCard = ({ badge, onClick, isLocked = false }) => {
  return (
    <div 
      className={`flex-shrink-0 w-full h-full rounded-xl p-4 border ${
        isLocked 
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer flex flex-col'
      }`}
      onClick={!isLocked ? () => onClick(badge) : null}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className={`p-2 rounded-full mb-3 relative shadow-md ${
          isLocked 
            ? 'bg-gray-200 dark:bg-gray-700' 
            : `bg-gradient-to-br ${badge.color} ${badge.additionalGradient || ''} p-0.5`
        }`}>
          <div className={`p-3 rounded-full ${
            isLocked ? 'bg-gray-100' : 'bg-white/90 dark:bg-gray-900/70'
          }`}>
            <span className={`text-2xl ${isLocked ? 'text-gray-400' : ''}`}>
              {badge.icon}
            </span>
          </div>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
              <span className="text-white text-2xl">🔒</span>
            </div>
          )}
        </div>
        <h4 className={`font-semibold ${
          isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
        }`}>
          {badge.name}
        </h4>
        <p className={`text-xs mt-1 line-clamp-2 ${
          isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
        }`}>
          {badge.description}
        </p>
        {isLocked ? (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Locked
          </div>
        ) : (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            {badge.points} pts
          </div>
        )}
      </div>
    </div>
  );
};

// Main Achievements Component
const Achievements = () => {
  // State
  const [achievements, setAchievements] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const { user } = useAuth();
  
  // Badge configuration
  const badgeTiers = [
    { 
      name: 'Bronze Saver', 
      points: 1000, 
      icon: '🥉',
      description: 'Earned for reaching 1,000 points',
      color: 'from-amber-600',
      additionalGradient: 'to-amber-400',
    },
    { 
      name: 'Silver Saver', 
      points: 5000, 
      icon: '🥈',
      description: 'Earned for reaching 5,000 points',
      color: 'from-gray-300',
      additionalGradient: 'via-gray-200 to-gray-100',
    },
    { 
      name: 'Gold Saver', 
      points: 10000, 
      icon: '🥇',
      description: 'Earned for reaching 10,000 points',
      color: 'from-yellow-400',
      additionalGradient: 'via-yellow-300 to-yellow-100',
    },
    { 
      name: 'Platinum Saver', 
      points: 25000, 
      icon: '💎',
      description: 'Earned for reaching 25,000 points',
      color: 'from-cyan-300',
      additionalGradient: 'via-blue-300 to-indigo-400',
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchAchievements(),
          fetchUserPoints(),
          fetchPointsHistory()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch achievements from API
  const fetchAchievements = async () => {
    try {
      const response = await api.getUserAchievements();
      const backendAchievements = response.data.data || {};
      
      // Map backend achievements to frontend format
      const mappedAchievements = [
        {
          id: 'budgetMaster',
          name: 'Budget Master',
          description: 'Stay under budget for 3 consecutive months',
          icon: '🎯',
          category: 'budget',
          earned: backendAchievements.budgetMaster?.earned || false,
          points: 100,
        },
        {
          id: 'goalCrusher',
          name: 'Goal Crusher',
          description: 'Complete 5 saving goals',
          icon: '🏆',
          category: 'savings',
          earned: backendAchievements.goalCrusher?.earned || false,
          points: 150,
        },
        {
          id: 'consistentSaver',
          name: 'Consistent Saver',
          description: 'Maintain saving streak for 6 months',
          icon: '📈',
          category: 'streak',
          earned: backendAchievements.consistentSaver?.earned || false,
          points: 150,
        },
      ];

      setAchievements(mappedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    }
  };

  // Fetch user points
  const fetchUserPoints = async () => {
    try {
      const response = await api.getUserPoints();
      setUserPoints(response.data?.data?.points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
      setUserPoints(0);
    }
  };

  // Fetch points history
  const fetchPointsHistory = async () => {
    try {
      const response = await api.getPointsHistory({ limit: 10 });
      setPointsHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching points history:', error);
      setPointsHistory([]);
    }
  };

  // Get current tier
  const getCurrentTier = () => {
    if (userPoints >= 10000) return 'Platinum';
    if (userPoints >= 5000) return 'Gold';
    if (userPoints >= 1000) return 'Silver';
    return 'Bronze';
  };

  // Get next tier
  const getNextTier = () => {
    const tier = getCurrentTier();
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : 'Max Level';
  };

  // Get unlocked badges
  const getUnlockedBadges = () => {
    return badgeTiers.filter(badge => userPoints >= badge.points);
  };

  // Get next badge to unlock
  const getNextBadge = () => {
    const unlockedBadges = getUnlockedBadges();
    return badgeTiers.find(badge => !unlockedBadges.some(ub => ub.name === badge.name));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user-friendly reason text
  const getPointsReasonText = (entry) => {
    const { reason, relatedModel, description } = entry;
    
    // If we have a description, use it as it's already formatted
    if (description && description !== 'Points updated') {
      return description;
    }
    
    // Otherwise, create a user-friendly message based on the reason
    switch(reason) {
      case 'budget_under_limit':
        return 'Stayed under budget';
      case 'goal_completed':
        return 'Goal completed';
      case 'goal_savings':
        return 'Savings goal progress';
      case 'debt_payment':
        return 'Debt payment';
      case 'debt_completed':
        return 'Debt fully paid off';
      case 'weekly_login_streak':
        return 'Login streak bonus';
      case 'monthly_savings':
        return 'Monthly savings';
      default:
        return 'Points updated';
    }
  };

  // Get achievement icon
  const getAchievementIcon = (type) => {
    const icons = {
      'savings': '💰',
      'budget': '📊',
      'debt': '🏦',
      'streak': '🔥',
      'general': '🏆'
    };
    return icons[type] || '🏅';
  };

  // Categorize achievements
  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {});

  // Category names
  const categoryNames = {
    'savings': 'Savings Goals',
    'budget': 'Budget Mastery',
    'debt': 'Debt Management',
    'streak': 'Consistency',
    'general': 'General',
    'other': 'Other Achievements'
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-3">
          Your Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Track your progress and earn rewards
        </p>
      </div>

      {/* Points Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Points</h2>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                Tier: <span className="font-medium">{getCurrentTier()}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Next: <span className="font-medium">{getNextTier()}</span>
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl font-bold py-4 px-8 rounded-xl shadow-lg">
            {userPoints.toLocaleString()}
            <span className="text-lg ml-2 font-normal">points</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-8">
        {['achievements', 'points'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-12">
        {activeTab === 'achievements' ? (
          <div className="space-y-8">
            {/* Badges Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Badges</h2>
              
              {getUnlockedBadges().length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {badgeTiers.map((badge) => {
                      const isUnlocked = getUnlockedBadges().some(b => b.name === badge.name);
                      return (
                        <BadgeCard 
                          key={badge.name}
                          badge={badge}
                          onClick={setSelectedBadge}
                          isLocked={!isUnlocked}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Badge Progress</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getUnlockedBadges().length} of {badgeTiers.length} badges earned
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round((getUnlockedBadges().length / badgeTiers.length) * 100)}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Badges Earned Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Complete more achievements to earn your first badge!
                  </p>
                </div>
              )}
            </div>

            {/* Achievements Section - Horizontal Layout */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Achievements</h3>
              </div>
              <div className="flex flex-nowrap overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex space-x-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="w-64 flex-shrink-0">
                      <AchievementCard 
                        achievement={achievement}
                        onClick={setSelectedBadge}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Points History</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Last updated: {formatDate(new Date().toISOString())}
              </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {pointsHistory.length > 0 ? (
                pointsHistory.map((entry, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          entry.points > 0 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {entry.points > 0 ? '↑' : '↓'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {getPointsReasonText(entry)}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(entry.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium ${
                        entry.points > 0 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {entry.points > 0 ? '+' : ''}{entry.points} pts
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No points history available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeCard3D 
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default Achievements;