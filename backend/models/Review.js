const mongoose = require('mongoose');

/**
 * Review Model
 * Handles customer reviews for products
 * 
 * Security:
 * - Only verified purchasers can review (optional flag)
 * - Content sanitized on input
 * - Rate limiting on review submission
 * - One review per user per product
 */
const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a product'],
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
        index: true,
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    // Verified purchase badge
    isVerifiedPurchase: {
        type: Boolean,
        default: false,
    },
    // Moderation
    isApproved: {
        type: Boolean,
        default: true, // Auto-approve, can be changed for moderation
    },
    isReported: {
        type: Boolean,
        default: false,
    },
    reportReason: {
        type: String,
        maxlength: 500,
    },
    // Helpful votes
    helpfulVotes: {
        type: Number,
        default: 0,
    },
    helpfulVoters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            'rating.average': Math.round(stats[0].avgRating * 10) / 10,
            'rating.count': stats[0].numReviews,
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            'rating.average': 0,
            'rating.count': 0,
        });
    }
};

// Post-save hook to recalculate rating
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.product);
});

// Post-remove hook to recalculate rating
reviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
