const { logger } = require('../utils/logger');

// Custom error class 
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Generic error logging
  logger.error(`Error: ${err.message}`);

  // Stack should only show in dev, not prod
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // Send error response
  if (error.isOperational) {
    // Known operational errors
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    // Unknown errors - don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    } else {
      // In development, send detailed error
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: err.stack,
        error: err
      });
    }
  }
};

module.exports = { AppError, errorHandler };