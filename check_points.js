const mongoose = require('mongoose');
const PointsLog = require('./backend/models/PointsLog');
const User = require('./backend/models/User');
const Leaderboard = require('./backend/models/Leaderboard');

const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/bachat_saathi';

async function checkPoints() {
    try {
        await mongoose.connect(DB_URL);
        console.log('--- DB Connection Success ---');

        const userCount = await User.countDocuments();
        console.log('User Count:', userCount);

        const logCount = await PointsLog.countDocuments();
        console.log('PointsLog Count:', logCount);

        const leaderboardEntries = await Leaderboard.countDocuments();
        console.log('Leaderboard Entries:', leaderboardEntries);

        const logs = await PointsLog.aggregate([
            { $group: { _id: '$userId', totalPoints: { $sum: '$points' }, count: { $sum: 1 } } }
        ]);
        console.log('Points Aggregation by User:');
        for (const log of logs) {
            const user = await User.findById(log._id);
            console.log(`- User: ${user?.name || log._id}, Total Points: ${log.totalPoints}, Log Entries: ${log.count}`);
        }

        const entries = await Leaderboard.find();
        console.log('\nLeaderboard Collection Content:');
        for (const entry of entries) {
            console.log(`- User: ${entry.username}, Monthly: ${entry.monthlyPoints}, Lifetime: ${entry.lifetimePoints}, Rank: ${entry.monthlyRank}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPoints();
