const winston = require('winston');
const path = require('path');

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [

    // Level of 'error' or above belongs in a file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Level of 'info' or above belongs in combined log
    new winston.transports.File({ filename: 'combined.log' }),
  ]
});

// If we're not in production, also log to the console with a simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}


module.exports = { logger };