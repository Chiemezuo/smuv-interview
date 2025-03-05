const express = require('express');
const { 
  setSaleDate,
} = require('../controllers/saleController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin only routes
router.post('/date/', protect, admin, setSaleDate);

module.exports = router;