const mongoose = require('mongoose');

/**
 * Wishlist Model
 * Stores user favorites
 * 
 * Strategy:
 * - Array of product IDs for fast looking up
 * - References Product for population
 */
const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
