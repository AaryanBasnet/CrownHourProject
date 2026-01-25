const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logUserAction } = require('../utils/auditLogger');

/**
 * Get user's cart
 * @route GET /api/cart
 */
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name slug images price stock');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve cart' });
    }
};

/**
 * Add item to cart
 * @route POST /api/cart/add
 */
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, color, strap } = req.body;
        const userId = req.user._id;

        // Verify product exists and get price
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Security: Calculate effective price from DB source of truth
        // DO NOT trust client-provided priceModifier
        let effectivePrice = product.price; // Base price
        let verifiedStrap = null;

        if (strap && strap.material) {
            // Find the strap variant in the product document
            // Assuming product.variants.straps exists and has the data
            const dbStrap = product.variants?.straps?.find(
                s => s.material === strap.material && s.inStock
            );

            if (!dbStrap) {
                return res.status(400).json({ success: false, message: 'Invalid or unavailable strap option' });
            }

            effectivePrice += dbStrap.priceModifier || 0;

            // Store the verified strap data, not the user input
            verifiedStrap = {
                material: dbStrap.material,
                priceModifier: dbStrap.priceModifier
            };
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if identical item exists (same product + same variants)
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            item.color?.name === color?.name &&
            item.strap?.material === verifiedStrap?.material
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
            // Update price in case it changed
            cart.items[itemIndex].price = effectivePrice;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: effectivePrice,
                color,
                strap: verifiedStrap, // Use verified strap object
            });
        }

        await cart.save();

        // Populate for response
        await cart.populate('items.product', 'name slug images price stock');

        res.status(200).json({ success: true, data: cart, message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to add item to cart' });
    }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/item/:itemId
 */
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name slug images price stock');

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/item/:itemId
 */
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items.pull(itemId);
        await cart.save();
        await cart.populate('items.product', 'name slug images price stock');

        res.status(200).json({ success: true, data: cart, message: 'Item removed' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item' });
    }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 */
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ success: true, data: { items: [], subtotal: 0 } });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
