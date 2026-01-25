const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logUserAction } = require('../utils/auditLogger');
const validator = require('validator');

/**
 * Review Controller
 * Handles all review-related operations
 * 
 * Security:
 * - Input sanitization with validator
 * - One review per user per product
 * - Verified purchase check
 * - Rate limiting at route level
 * - XSS prevention
 */

/**
 * Sanitize review input to prevent XSS
 */
const sanitizeReviewInput = (input) => {
    return {
        title: validator.escape(validator.trim(input.title || '')),
        comment: validator.escape(validator.trim(input.comment || '')),
        rating: parseInt(input.rating) || 0,
    };
};

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const reviews = await Review.find({
            product: productId,
            isApproved: true
        })
            .populate('user', 'firstName lastName')
            .sort(sort)
            .limit(Number(limit))
            .skip(skip);

        const total = await Review.countDocuments({
            product: productId,
            isApproved: true
        });

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
                ratingDistribution: ratingDistribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }),
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message,
        });
    }
};

/**
 * @desc    Get top rated reviews (5 stars) for testimonials
 * @route   GET /api/reviews/top-rated
 * @access  Public
 */
const getTopRatedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            rating: 5,
            isApproved: true
        })
            .populate('user', 'firstName lastName')
            .sort('-createdAt')
            .limit(3);

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Get top rated reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top reviews',
            error: error.message
        });
    }
};

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private (authenticated users)
 */
const createReview = async (req, res) => {
    try {
        const { productId, title, comment, rating } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!productId || !title || !comment || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Please provide productId, title, comment, and rating',
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product',
            });
        }

        // Check if user has purchased this product (verified purchase)
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: { $in: ['delivered', 'completed'] },
        });

        // Sanitize input
        const sanitizedInput = sanitizeReviewInput({ title, comment, rating });

        // Create review
        const review = await Review.create({
            product: productId,
            user: userId,
            ...sanitizedInput,
            isVerifiedPurchase: !!hasPurchased,
        });

        // Populate user info for response
        await review.populate('user', 'firstName lastName');

        await logUserAction('review_created', {
            userId,
            productId,
            reviewId: review._id,
            rating: sanitizedInput.rating,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: { review },
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product',
            });
        }

        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message,
        });
    }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (review owner only)
 */
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, comment, rating } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check ownership
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews',
            });
        }

        // Sanitize input
        const sanitizedInput = sanitizeReviewInput({
            title: title || review.title,
            comment: comment || review.comment,
            rating: rating || review.rating
        });

        // Update review
        review.title = sanitizedInput.title;
        review.comment = sanitizedInput.comment;
        review.rating = sanitizedInput.rating;
        await review.save();

        await review.populate('user', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: { review },
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (review owner or admin)
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role?.name || req.user.role;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check ownership or admin
        if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews',
            });
        }

        const productId = review.product;
        await review.deleteOne();

        // Recalculate product rating
        await Review.calculateAverageRating(productId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message,
        });
    }
};

/**
 * @desc    Vote review as helpful
 * @route   POST /api/reviews/:id/helpful
 * @access  Private
 */
const voteHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check if user already voted
        if (review.helpfulVoters.includes(userId)) {
            // Remove vote
            review.helpfulVoters = review.helpfulVoters.filter(
                voter => voter.toString() !== userId.toString()
            );
            review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
        } else {
            // Add vote
            review.helpfulVoters.push(userId);
            review.helpfulVotes += 1;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Vote updated',
            data: { helpfulVotes: review.helpfulVotes },
        });
    } catch (error) {
        console.error('Vote helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vote',
            error: error.message,
        });
    }
};

module.exports = {
    getProductReviews,
    getTopRatedReviews,
    createReview,
    updateReview,
    deleteReview,
    voteHelpful,
};
