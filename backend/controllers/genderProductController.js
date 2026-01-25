const Product = require('../models/Product');

/**
 * Get products by gender/category
 * This is a specialized query for Men/Women pages
 * 
 * @param {string} gender - 'men' or 'women'
 * @param {object} filters - Additional filters (movement, strap, etc.)
 * @returns {Promise} Products matching gender and filters
 */
const getProductsByGender = async (gender, filters = {}) => {
    const query = { isActive: true };

    // Gender-specific categories
    // In a real app, you'd have a 'gender' field in the Product model
    // For now, we'll use category-based filtering as a demo
    if (gender === 'men') {
        // Men's watches are typically: sport, chronograph, dive
        query.category = { $in: ['sport', 'luxury'] };
    } else if (gender === 'women') {
        // Women's watches are typically: elegant, vintage, casual
        query.category = { $in: ['vintage', 'casual', 'smart'] };
    }

    // Apply additional filters
    if (filters.movement) {
        query['specifications.movement'] = filters.movement;
    }

    if (filters.strapMaterial) {
        query['specifications.strapMaterial'] = filters.strapMaterial;
    }

    if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    return query;
};

/**
 * @desc    Get men's watches
 * @route   GET /api/products/men
 * @access  Public
 */
const getMensProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = '-createdAt',
            movement,
            strapMaterial,
            minPrice,
            maxPrice,
            search,
        } = req.query;

        const query = await getProductsByGender('men', {
            movement,
            strapMaterial,
            minPrice,
            maxPrice,
            search,
        });

        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .select('-createdBy -updatedBy');

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get mens products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mens products',
            error: error.message,
        });
    }
};

/**
 * @desc    Get women's watches
 * @route   GET /api/products/women
 * @access  Public
 */
const getWomensProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = '-createdAt',
            movement,
            strapMaterial,
            minPrice,
            maxPrice,
            search,
        } = req.query;

        const query = await getProductsByGender('women', {
            movement,
            strapMaterial,
            minPrice,
            maxPrice,
            search,
        });

        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .select('-createdBy -updatedBy');

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get womens products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch womens products',
            error: error.message,
        });
    }
};

module.exports = {
    getMensProducts,
    getWomensProducts,
};
