const express = require('express');
const { 
  registerUser, 
  loginUser,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.post('/logout', protect, logoutUser)

module.exports = router;