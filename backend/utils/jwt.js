// JWT Configuration
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE || 30; // days

module.exports = {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_COOKIE_EXPIRE
};
