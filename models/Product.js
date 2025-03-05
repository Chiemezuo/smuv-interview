const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  image: {
    // May optionally be an encoding
    type: String
  },
  totalStock: { 
    type: Number, 
    default: () => parseInt(process.env.DEFAULT_STOCK_AMOUNT),
    min: [0, 'Total stock cannot be negative']
  },
  availableStock: { 
    type: Number, 
    default: function() {
      return this.totalStock;
    },
    min: [0, 'Available stock cannot be negative']
  },
  saleStartTime: { 
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ saleActive: 1 });
productSchema.index({ availableStock: 1 });

// Add versioning for optimistic concurrency control
// productSchema.plugin(require('mongoose-version'));

const Product = mongoose.model('Product', productSchema);

module.exports = Product;