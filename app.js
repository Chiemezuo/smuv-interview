const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorMiddleware');
const { logger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser())
// For form submissions
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, _, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Landing page to check if app is working
app.get('/', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;