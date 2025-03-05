const express = require('express');
const { 
  getLeaderboardForProduct,
  getLeaderboardForAllProducts,
} = require('../controllers/leaderboardController');

const router = express.Router();

// Public routes
router.get('/:productId', getLeaderboardForProduct);
router.get('/', getLeaderboardForAllProducts)

module.exports = router;