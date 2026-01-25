const express = require('express');
const router = express.Router();
const {
    getWishlist,
    toggleWishlist,
    checkWishlistStatus
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(authLimiter);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.get('/check/:productId', checkWishlistStatus);

module.exports = router;
