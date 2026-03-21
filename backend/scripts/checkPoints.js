const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
async function checkPointsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const pointsCollection = db.collection('pointslogs');
    const aggregation = await pointsCollection.aggregate([
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$pointsAwarded' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]).toArray();
    console.log('Points by user:');
    aggregation.forEach(item => {
      console.log(`  User ${item._id}: ${item.totalPoints} points (${item.count} entries)`);
    });
    const sample = await pointsCollection.findOne();
    console.log('\nSample entry:', sample);
    await mongoose.connection.close();
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
checkPointsData();
