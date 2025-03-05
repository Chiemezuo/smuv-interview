const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { logger } = require('../utils/logger');
const { validateId, validateName, validateDescription, validatePrice, validateImage, validateTotalStock } = require('../utils/validation');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const fetchProducts = async () => {
      return await Product.find({});
    };
    
    const products = await fetchProducts()
    res.status(200).json(products)
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const fetchProduct = async () => {
      // Validate product ID
      validateId(req.params.id)

      const product = await Product.findById(req.params.id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }      
      return product;
    };

    const product = await fetchProduct()
    res.status(200).json(product)
  } catch (error) {    
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, totalStock } = req.body;

    // Perform validations
    validateName(name)
    validateDescription(description)
    validatePrice(price)
    validateImage(image)
    validateTotalStock(totalStock)
    
    const product = await Product.create({
      name,
      description,
      price,
      image,
      totalStock,
      availableStock: totalStock // Initially same as total stock
    });
    
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
};