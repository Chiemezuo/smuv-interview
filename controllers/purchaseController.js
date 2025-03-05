const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const { logger } = require('../utils/logger');
const { validateQuantity, validateId } = require('../utils/validation');

/**
 * @desc    Purchase a product during a flash sale
 * @route   POST /api/purchase
 * @access  Private
 */
const purchaseProduct = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Perform validations
    validateQuantity(quantity)
    validateId(productId)
    
    // Get product with session for transaction
    const product = await Product.findById(productId).session(session);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if sale is active (product in available stock and start date )
    const currentDate = new Date()
    if (!product.availableStock || currentDate < product.saleStartTime) {
      throw new AppError('This product is not currently on sale', 400);
    }
    
    // Check if there's enough stock and update atomically to prevent race conditions
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        availableStock: { $gte: quantity }
      },
      {
        $inc: { availableStock: -quantity }
      },
      {
        new: true,
        session,
        runValidators: true
      }
    );
    
    if (!updatedProduct || updatedProduct.availableStock < 0) {
      throw new AppError('Not enough stock available', 400);
    }
    
    // Create order
    const order = new Order({
      user: userId,
      product: productId,
      quantity,
      price: product.price,
      totalAmount: product.price * quantity,
      purchaseTime: new Date()
    });
    
    await order.save({ session });
    
    // Add to user's purchase history
    await User.findByIdAndUpdate(
      userId,
      { $push: { purchaseHistory: order._id } },
      { session }
    );
    
    await session.commitTransaction();
    
    logger.info(`User ${userId} purchased ${quantity} units of product ${productId}`);
    
    res.status(201).json({
      message: 'Purchase successful',
      order: {
        id: order._id,
        product: {
          id: product._id,
          name: product.name
        },
        quantity,
        totalAmount: order.totalAmount,
        purchaseTime: order.purchaseTime
      },
      remainingStock: updatedProduct.availableStock
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get user's purchase history
 * @route   GET /api/purchase/history
 * @access  Private
 */
const getPurchaseHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ user: userId })
      .populate('product', 'name price')
      .sort({ purchaseTime: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  purchaseProduct,
  getPurchaseHistory
};