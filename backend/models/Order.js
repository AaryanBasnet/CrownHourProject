const mongoose = require('mongoose');

/**
 * Order Model
 * Manages customer orders with order tracking and status
 *
 * Security:
 * - Customers can only view their own orders
 * - Admins can view and manage all orders
 * - Order modifications are logged in AuditLog
 */
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for order'],
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Store product snapshot to preserve order details even if product changes
    productSnapshot: {
      name: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
  }],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Security: Never store full card numbers
    // Only store last 4 digits for reference
    cardLastFour: String,
    transactionId: String,
    paidAt: Date,
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  trackingNumber: String,
  shippingCarrier: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  notes: String,
}, {
  timestamps: true,
});

// Pre-save middleware to add status to history
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Indexes for query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
