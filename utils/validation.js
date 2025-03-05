const Joi = require('joi');
const { AppError } = require('../middleware/errorMiddleware');

// Email validation schema
const emailSchema = Joi.string().email().messages({
  'string.email': 'Invalid email format',
  'string.empty': 'Email cannot be empty'
});
const validateEmail = (email) => {
  const { error } = emailSchema.validate(email);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Password validation schema
const passwordSchema = Joi.string().min(6).messages({
  'string.min': 'Password must be at least 6 characters long',
  'string.empty': 'Password cannot be empty'
});
const validatePassword = (password) => {
  const { error } = passwordSchema.validate(password);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Quantity validation schema
const quantitySchema = (maxAllowed) => Joi.number().integer().positive().max(maxAllowed).messages({
  'number.base': 'Quantity must be a number',
  'number.integer': 'Quantity must be an integer',
  'number.positive': 'Quantity must be a positive number',
  'number.max': `Quantity cannot exceed ${maxAllowed}`
});
const validateQuantity = (quantity, maxAllowed = parseInt(process.env.MAX_PURCHASE_PER_USER)) => {
  const parsedQuantity = parseInt(quantity, 10);
  const { error } = quantitySchema(maxAllowed).validate(parsedQuantity);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Role validation schema
const roleSchema = Joi.string().valid('admin', 'user').messages({
  'any.only': 'Role must be either admin or user'
})
const validateRole = (role) => {
  const { error } = roleSchema.validate(role)
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
}

// Date validation schema (ISO 8601 format)
const dateSchema = Joi.string().isoDate().messages({
  'string.isoDate': 'Invalid date format. Must be ISO 8601'
});
const validateDate = (date) => {
  const { error } = dateSchema.validate(date);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Mongoose ID validation schema (MongoDB ObjectId format)
const mongooseIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/).messages({
  'string.pattern.base': 'Invalid mongodb ID format'
});
const validateId = (id) => {
  const { error } = mongooseIdSchema.validate(id);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Product name validation schema
const nameSchema = Joi.string().max(100).messages({
  'string.min': 'Product name must be at least 3 characters long',
  'string.max': 'Product name cannot exceed 100 characters',
  'string.empty': 'Product name cannot be empty'
});
const validateName = (name) => {
  const { error } = nameSchema.validate(name);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Product description validation schema
const descriptionSchema = Joi.string().max(500).messages({
  'string.max': 'Product description cannot exceed 500 characters'
});
const validateDescription = (description) => {
  const { error } = descriptionSchema.validate(description);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Price validation schema (positive number)
const priceSchema = Joi.number().positive().messages({
  'number.base': 'Price must be a number',
  'number.positive': 'Price must be a positive number'
});
const validatePrice = (price) => {
  const { error } = priceSchema.validate(price);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Image validation schema (Base64 encoding)
const base64ImageSchema = Joi.string().base64().messages({
  'string.base64': 'Invalid image format. Must be Base64 encoded'
});
const validateImage = (image) => {
  const { error } = base64ImageSchema.validate(image);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

// Total stock validation schema (integer, non-negative)
const totalStockSchema = Joi.number().integer().min(0).messages({
  'number.base': 'Total stock must be a number',
  'number.integer': 'Total stock must be an integer',
  'number.min': 'Total stock cannot be negative'
});
const validateTotalStock = (totalStock) => {
  const { error } = totalStockSchema.validate(totalStock);
  if (error) {
    throw new AppError(error.details[0].message, 400)
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateQuantity,
  validateRole,
  validateDate,
  validateId,
  validateName,
  validateDescription,
  validatePrice,
  validateImage,
  validateTotalStock,
};
