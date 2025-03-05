const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const { logger } = require('../utils/logger');
const {
  validateEmail,
  validatePassword,
  validateRole,
} = require('../utils/validation')

// Generate JWT token
const generateToken = async (id, res) => {
  // Wrap the email and role in the jwt too?
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  // Add token to user's whitelisted tokens
  await User.findByIdAndUpdate(id, {
    $push: { whitelistedTokens: token }
  })

  // Token should be stored in HttpOnly cookies
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV == 'production' // Use HTTPS in prod
  })

  return token
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    // Option to create an admin user from this endpoint
    const { email, password, role = 'user' } = req.body;

    // Perform validations
    validateEmail(email)
    validatePassword(password)
    validateRole(role)

    // Check if user already exists
    const userExists = await User.findOne({email});
    
    if (userExists) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = await User.create({
      email,
      password, // Password will be hashed in the model
      role
    });

    if (user) {
      // Generate token
      await generateToken(user._id, res);

      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    } else {
      throw new AppError('Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Perform validations
    validateEmail(email)
    validatePassword(password)

    // Find user by email (with password)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      logger.warn(`Failed login attempt for email: ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    await generateToken(user._id, res);

    logger.info(`User logged in: ${user._id}`);

    // Return user data and token
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new AppError('No token provided', 400);
    }

    // Remove token from user's whitelistedTokens
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { whitelistedTokens: token }
    });

    // Clear the cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};