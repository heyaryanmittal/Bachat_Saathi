#!/usr/bin/env node

/**
 * Leaderboard System Diagnostic Test Script
 * 
 * This script helps diagnose issues with the leaderboard system
 * Usage: node backend/scripts/testLeaderboard.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Import models
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const PointsLog = require('../models/PointsLog');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}`)
};

async function runTests() {
  try {
    // Connect to MongoDB
    log.info('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bachat_saathi';
    
    await mongoose.connect(mongoUri);
    log.success('Connected to MongoDB');

    // Test 1: Check User count
    log.header('Test 1: Database Check');
    const userCount = await User.countDocuments();
    log.info(`Total Users in DB: ${userCount}`);
    
    if (userCount === 0) {
      log.warn('No users found. Create some users first!');
      return;
    }

    // Test 2: Check PointsLog
    log.header('Test 2: Points Log Check');
    const pointsLogCount = await PointsLog.countDocuments();
    log.info(`Total PointsLog entries: ${pointsLogCount}`);

    if (pointsLogCount > 0) {
      const pointsStats = await PointsLog.aggregate([
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$pointsAwarded' },
            avgPoints: { $avg: '$pointsAwarded' },
            maxPoints: { $max: '$pointsAwarded' },
            minPoints: { $min: '$pointsAwarded' }
          }
        }
      ]);

      if (pointsStats.length > 0) {
        const stats = pointsStats[0];
        log.info(`Total Points Awarded: ${stats.totalPoints}`);
        log.info(`Average Points per Entry: ${stats.avgPoints.toFixed(2)}`);
        log.info(`Max Points: ${stats.maxPoints}`);
        log.info(`Min Points: ${stats.minPoints}`);
      }
    } else {
      log.warn('No PointsLog entries found. Users need to perform activities first!');
    }

    // Test 3: Check Leaderboard Collection
    log.header('Test 3: Leaderboard Collection Check');
    const leaderboardCount = await Leaderboard.countDocuments();
    log.info(`Leaderboard Entries: ${leaderboardCount}`);

    if (leaderboardCount > 0) {
      const topUser = await Leaderboard.findOne().sort({ lifetimePoints: -1 });
      if (topUser) {
        log.info(`Top User: ${topUser.username} (${topUser.lifetimePoints} points)`);
      }
    } else {
      log.warn('No leaderboard entries. Run populate-leaderboard endpoint first!');
    }

    // Test 4: Sample User Details
    log.header('Test 4: Sample User Details');
    const sampleUser = await User.findOne();
    if (sampleUser) {
      log.info(`Sample User: ${sampleUser.name || 'N/A'}`);
      log.info(`User ID: ${sampleUser._id}`);
      
      // Check if this user has leaderboard entry
      const leaderboardEntry = await Leaderboard.findOne({ userId: sampleUser._id });
      if (leaderboardEntry) {
        log.success('Leaderboard entry exists');
        log.info(`  Monthly Points: ${leaderboardEntry.monthlyPoints}`);
        log.info(`  Lifetime Points: ${leaderboardEntry.lifetimePoints}`);
        log.info(`  Monthly Rank: ${leaderboardEntry.monthlyRank || 'N/A'}`);
        log.info(`  Lifetime Rank: ${leaderboardEntry.lifetimeRank || 'N/A'}`);
        log.info(`  Badges: ${leaderboardEntry.badges.join(', ') || 'None'}`);
      } else {
        log.warn('No leaderboard entry for this user');
      }

      // Check PointsLog for this user
      const userPointsLogs = await PointsLog.countDocuments({ userId: sampleUser._id });
      log.info(`PointsLog entries for user: ${userPointsLogs}`);
    }

    // Test 5: Leaderboard Rankings
    log.header('Test 5: Top 10 Users');
    const topUsers = await Leaderboard.find()
      .sort({ lifetimePoints: -1 })
      .limit(10);

    if (topUsers.length > 0) {
      topUsers.forEach((user, index) => {
        const rank = index + 1;
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        const medal = medals[rank] || `#${rank}`;
        const badges = user.badges.length > 0 ? ` | ${user.badges.join(', ')}` : '';
        log.info(`${medal} ${user.username} - ${user.lifetimePoints} pts${badges}`);
      });
    } else {
      log.error('No leaderboard data found!');
    }

    // Test 6: Database Health
    log.header('Test 6: Database Health');
    log.info(`Users: ${userCount}`);
    log.info(`PointsLog entries: ${pointsLogCount}`);
    log.info(`Leaderboard entries: ${leaderboardCount}`);
    
    const healthPercentage = leaderboardCount > 0 
      ? ((leaderboardCount / userCount) * 100).toFixed(1)
      : 0;
    log.info(`Coverage: ${healthPercentage}% (${leaderboardCount}/${userCount})`);

    if (leaderboardCount === userCount) {
      log.success('All users have leaderboard entries!');
    } else if (leaderboardCount > 0) {
      log.warn(`${userCount - leaderboardCount} users missing leaderboard entries`);
    } else {
      log.error('No leaderboard data. Run populate-leaderboard first!');
    }

    // Test 7: Recent Activity
    log.header('Test 7: Recent Activity');
    const recentActivity = await PointsLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name');

    if (recentActivity.length > 0) {
      recentActivity.forEach(entry => {
        const date = new Date(entry.createdAt).toLocaleString();
        const username = entry.userId?.name || 'Unknown';
        log.info(`${username}: +${entry.pointsAwarded} pts (${entry.reason}) - ${date}`);
      });
    } else {
      log.warn('No recent activity found');
    }

    log.header('Test Summary');
    const isHealthy = leaderboardCount > 0 && pointsLogCount > 0;
    if (isHealthy) {
      log.success('Leaderboard system is healthy!');
      log.info('✓ Users exist');
      log.info('✓ Leaderboard entries exist');
      log.info('✓ Points are being tracked');
    } else {
      log.error('Leaderboard system needs setup!');
      log.info('Steps to fix:');
      log.info('1. Ensure users exist in database');
      log.info('2. Run: POST /api/debug/populate-leaderboard');
      log.info('3. Or run: node backend/scripts/populateLeaderboard.js');
      log.info('4. Then create some transactions to earn points');
    }

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log.info('Disconnected from MongoDB');
  }
}

// Run tests
runTests();
