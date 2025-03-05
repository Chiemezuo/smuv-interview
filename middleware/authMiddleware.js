const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  // let token;
  const token = req.cookies.jwt

  if (!token) {
    logger.warn('Auth failed: No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token payload (without password)
    const user = await User.findById(decoded.id).select('-password');

    // Additionally check if token is whitelisted
    if (!user || !user.whitelistedTokens.includes(token)) {
      logger.warn(`Auth failed: token not whitelisted for User with ID ${decoded.id}`);
      return res.status(401).json({ message: 'Not authorized, invalid token or user' });
    }

    req.user = user
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }

};

/**
 * Middleware to restrict routes to admin users
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn(`Admin access denied for user ${req.user?._id}`);
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };