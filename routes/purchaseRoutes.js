const express = require('express');
const { 
  purchaseProduct, 
  getPurchaseHistory 
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, purchaseProduct);
router.get('/history', protect, getPurchaseHistory);

module.exports = router;