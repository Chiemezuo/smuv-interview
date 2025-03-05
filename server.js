require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info('MongoDB connection established successfully');
    
  })
  .catch(err => {
    logger.error('MongoDB connection error:');
    logger.error(err.message);
    process.exit(1);
  });

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running`);
});