const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
    } else {
      console.log('User found:');
      console.log('  ID:', user._id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  PasswordHash:', user.passwordHash ? 'EXISTS' : 'MISSING');
      console.log('  is2FAEnabled:', user.is2FAEnabled);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

const emailToCheck = process.argv[2];
if (!emailToCheck) {
  console.log('Usage: node check_user.js <email>');
} else {
  checkUser(emailToCheck);
}
