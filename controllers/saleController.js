const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { logger } = require('../utils/logger');
const { validateId, validateDate } = require('../utils/validation');

/**
 * @desc    Set a flash sale date for a product
 * @route   POST /api/sales/date/:productId
 * @access  Private/Admin
 */
const setSaleDate = async (req, res, next) => {
  // Do a validation for the sale start date
  try {
    const { productId, date } = req.body

    // Perform validations
    validateId(productId)
    validateDate(date)
    
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.availableStock) {
      throw new AppError('Sale is already active for this product', 400)
    }

    product.saleStartTime = date

    // Reset available stock to default stock
    logger.info(`Resetting available stock for product ${productId} from ${product.availableStock} to ${product.totalStock}`);
    product.availableStock = product.totalStock;

    await product.save();
    
    logger.info(`Flash sale date set for product ${productId} with ${product.availableStock} units`);
    
    res.status(200).json({
      message: 'Flash sale date set successfully',
      product
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  setSaleDate,
};