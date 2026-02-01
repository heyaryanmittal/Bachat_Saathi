const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const PointsLog = require('../models/PointsLog');
const LeaderboardService = require('../services/leaderboardService');

dotenv.config();

/**
 * Script to populate leaderboard with existing users
 * This script:
 * 1. Fetches all users from the database
 * 2. Creates leaderboard entries for each user
 * 3. Calculates their lifetime points from PointsLog
 * 4. Ranks them accordingly
 * 5. Assigns badges
 */

async function populateLeaderboard() {
  try {
    console.log('🚀 Starting leaderboard population...\n');

    // Connect to MongoDB
    const DB_URI = process.env.MONGODB_URI;
    if (!DB_URI) {
      throw new Error('❌ MONGODB_URI not found in .env');
    }

    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch all users
    const users = await User.find({}).select('_id name email');
    console.log(`📊 Found ${users.length} users\n`);

    if (users.length === 0) {
      console.log('⚠️ No users found in database');
      await mongoose.connection.close();
      return;
    }

    // Clear existing leaderboard entries
    const deleteResult = await Leaderboard.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing leaderboard entries\n`);

    // Process each user
    let processedCount = 0;
    const leaderboardData = [];

    for (const user of users) {
      try {
        // Calculate total lifetime points from PointsLog
        const pointsResult = await PointsLog.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);

        const totalPoints = pointsResult.length > 0 ? pointsResult[0].total : 0;

        // Calculate monthly points (current month only)
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyPointsResult = await PointsLog.aggregate([
          {
            $match: {
              userId: user._id,
              createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
          },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);

        const monthlyPoints = monthlyPointsResult.length > 0 ? monthlyPointsResult[0].total : 0;

        // Create leaderboard entry
        const leaderboardEntry = new Leaderboard({
          userId: user._id,
          username: user.name,
          monthlyPoints: monthlyPoints, // Calculate from current month activities
          lifetimePoints: totalPoints,
          savingsAmount: 0, // Can be calculated from transactions if needed
          streak: 0,
          badges: [],
          lastUpdated: new Date(),
          lastMonthlyReset: currentMonthStart
        });

        await leaderboardEntry.save();
        leaderboardData.push({
          username: user.name,
          lifetimePoints: totalPoints,
          monthlyPoints: monthlyPoints
        });

        processedCount++;
        console.log(`✅ [${processedCount}/${users.length}] ${user.name} - Lifetime: ${totalPoints} points | Monthly: ${monthlyPoints} points`);
      } catch (error) {
        console.error(`❌ Error processing user ${user.name}:`, error.message);
      }
    }

    console.log(`\n✅ Created ${processedCount} leaderboard entries\n`);

    // Calculate and assign ranks
    console.log('📈 Calculating ranks and assigning badges...\n');
    await LeaderboardService.calculateRanks();

    // Fetch and display top 10
    const topUsers = await Leaderboard.find()
      .sort({ lifetimePoints: -1 })
      .limit(10)
      .select('username lifetimePoints lifetimeRank monthlyPoints badges');

    console.log('\n🏆 Top 10 Users (Lifetime Leaderboard):\n');
    console.log('Rank | Username | Lifetime Points | Badges');
    console.log('-----|----------|-----------------|--------');

    topUsers.forEach((user, index) => {
      const badges = user.badges.join(', ') || 'None';
      console.log(
        `${String(index + 1).padEnd(4)} | ${user.username.padEnd(8)} | ${String(user.lifetimePoints).padEnd(15)} | ${badges}`
      );
    });

    // Get statistics
    const totalLeaderboardEntries = await Leaderboard.countDocuments();
    const avgPoints = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$lifetimePoints' },
          max: { $max: '$lifetimePoints' },
          min: { $min: '$lifetimePoints' }
        }
      }
    ]);

    if (avgPoints.length > 0) {
      console.log('\n📊 Statistics:');
      console.log(`Total Entries: ${totalLeaderboardEntries}`);
      console.log(`Average Points: ${Math.round(avgPoints[0].avg)}`);
      console.log(`Max Points: ${avgPoints[0].max}`);
      console.log(`Min Points: ${avgPoints[0].min}`);
    }

    console.log('\n✅ Leaderboard population completed successfully!\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error during leaderboard population:', error);
    process.exit(1);
  }
}

// Run the script
populateLeaderboard();
