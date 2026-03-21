
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');
const { JWT_SECRET } = require('./jwt');
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided, authorization denied',
        code: 'NO_TOKEN'
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Session expired, please login again',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        error: error.message
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Not authorized as an admin',
      code: 'NOT_ADMIN'
    });
  }
};
module.exports = { protect, admin };