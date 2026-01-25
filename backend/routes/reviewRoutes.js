const express = require('express');
const router = express.Router();
const {
    getProductReviews,
    getTopRatedReviews,
    createReview,
    updateReview,
    deleteReview,
    voteHelpful,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * Review Routes
 * 
 * Security:
 * - Public: Read reviews
 * - Private: Create, update, delete reviews (authenticated)
 * - Rate limiting on all routes
 * - Input validation at controller level
 */

// Public routes
router.get('/top-rated', authLimiter, getTopRatedReviews);
router.get('/product/:productId', authLimiter, getProductReviews);

// Protected routes (require authentication)
router.post('/', protect, authLimiter, createReview);
router.put('/:id', protect, authLimiter, updateReview);
router.delete('/:id', protect, authLimiter, deleteReview);
router.post('/:id/helpful', protect, authLimiter, voteHelpful);

module.exports = router;
