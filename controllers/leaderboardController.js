const mongoose = require('mongoose')
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { validateId } = require('../utils/validation')

/**
 * @desc    Get purchase leaderboard for a product
 * @route   GET /api/leaderboard/:productId
 * @access  Public
 */
const getLeaderboardForProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Perform validation
    validateId(productId)
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    const fetchLeaderboard = async () => {
      // Use aggregation pipeline for better performance
      const leaderboard = await Order.aggregate([
        {
          $match: {
            product: new mongoose.Types.ObjectId(productId),
            successful: true
          }
        },
        {
          $sort: { purchaseTime: 1 }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            email: '$userDetails.email',
            quantity: 1,
            purchaseTime: 1,
            _id: 0
          }
        }
      ]);
      
      return {
        product: {
          id: product._id,
          name: product.name,
          totalStock: product.totalStock,
          availableStock: product.availableStock,
          soldOut: product.availableStock === 0
        },
        purchases: leaderboard
      };
    };
    
    const leaderboardData = await fetchLeaderboard();

    res.status(200).json(leaderboardData);
  } catch (error) {
    // Log error here
    next(error);
  }
};


/**
 * @desc    Get purchase leaderboard for all products
 * @route   GET /api/leaderboard/
 * @access  Public
 */
const getLeaderboardForAllProducts = async (req, res, next) => {
  try {
    const leaderboard = await Order.aggregate([
      {
        $match: { successful: true } // Only include successful purchases
      },
      {
        $sort: { purchaseTime: 1 } // Sort purchases chronologically
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $group: {
          _id: '$product',
          product: { $first: '$productDetails' },
          purchases: {
            $push: {
              email: '$userDetails.email',
              quantity: '$quantity',
              purchaseTime: '$purchaseTime'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          product: {
            id: '$product._id',
            name: '$product.name',
            totalStock: '$product.totalStock',
            availableStock: '$product.availableStock',
            soldOut: { $eq: ['$product.availableStock', 0] }
          },
          purchases: 1
        }
      }
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboardForProduct,
  getLeaderboardForAllProducts
};