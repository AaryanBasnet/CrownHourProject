const mongoose = require('mongoose');

/**
 * CartItem Schema
 * Individual items within a cart
 */
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    // Persist current price at time of adding (can be refreshed on view)
    price: {
        type: Number,
        required: true,
    },
    // Selected variants
    color: {
        name: String,
        hex: String,
    },
    strap: {
        material: String,
        priceModifier: { type: Number, default: 0 },
    },
}, { _id: false });

/**
 * Cart Model
 * Persists user shopping cart
 * 
 * Strategy:
 * - One cart per user
 * - Auto-expires after 30 days of inactivity (optional TTL)
 */
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One active cart per user
    },
    items: [cartItemSchema],
    subtotal: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Middleware to recalculate subtotal before saving
cartSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
