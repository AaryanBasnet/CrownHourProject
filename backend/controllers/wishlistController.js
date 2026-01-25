const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Get user wishlist
 * @route GET /api/wishlist
 */
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products', 'name slug price images category stock');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve wishlist' });
    }
};

/**
 * Toggle item in wishlist (Add/Remove)
 * @route POST /api/wishlist/toggle
 */
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, products: [] });
        }

        const index = wishlist.products.indexOf(productId);
        let action = '';

        if (index > -1) {
            // Remove
            wishlist.products.splice(index, 1);
            action = 'removed';
        } else {
            // Add
            wishlist.products.push(productId);
            action = 'added';
        }

        await wishlist.save();

        // Return *full* updated list (populated) so frontend is immediately synced
        await wishlist.populate('products', 'name slug price images category stock');

        res.status(200).json({
            success: true,
            data: wishlist,
            message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`
        });

    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
};

/**
 * Check if a product is in wishlist
 * @route GET /api/wishlist/check/:productId
 */
const checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
            products: productId
        });

        res.status(200).json({
            success: true,
            isInWishlist: !!wishlist
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Check status failed' });
    }
};

module.exports = {
    getWishlist,
    toggleWishlist,
    checkWishlistStatus
};
