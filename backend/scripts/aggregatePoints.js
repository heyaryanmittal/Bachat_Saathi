const mongoose = require('mongoose');
require('dotenv').config();
const PointsLog = require('../models/PointsLog');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log(`Found ${users.length} users\n`);
    
    for (const user of users) {
      const result = await PointsLog.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);
      
      const points = result.length > 0 ? result[0].total : 0;
      const entries = await PointsLog.countDocuments({ userId: user._id });
      console.log(`${user.name}: ${points} points (${entries} entries)`);
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
