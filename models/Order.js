const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required']
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  purchaseTime: { 
    type: Date, 
    default: Date.now
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  successful: { 
    type: Boolean, 
    default: true 
  },
  // transactionId: {
  //   type: String,
  //   unique: true,
  //   required: [true, 'Transaction ID is required']
  // }
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ purchaseTime: 1 });
orderSchema.index({ successful: 1 });

// Virtual field for computing total amount
orderSchema.virtual('computedTotalAmount').get(function() {
  return this.price * this.quantity;
});

// Pre-save middleware to generate transaction ID if not provided
// orderSchema.pre('save', function(next) {
//   if (!this.transactionId) {
//     this.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
//   }
//   next();
// });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;