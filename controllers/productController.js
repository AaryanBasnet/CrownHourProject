const Product = require('../models/Product');
const { logProductAction } = require('../utils/auditLogger');
const { sanitizeInput } = require('../utils/validation');

/**
 * Product Controller
 * Handles product management operations
 *
 * Security:
 * - Only admins can create/update/delete products
 * - Public can view active products
 * - All product modifications are logged
 * - Input validation prevents malicious data
 */

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      isActive,
    } = req.query;

    // Build query
    const query = {};

    // Security: Non-admin users can only see active products
    if (req.user?.role?.name !== 'admin') {
      query.isActive = true;
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search in name, description, brand
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Security: Non-admin users can only view active products
    if (!product.isActive && req.user?.role?.name !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new product (admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    // Security: Sanitize input
    const allowedFields = [
      'name',
      'description',
      'brand',
      'model',
      'price',
      'currency',
      'stock',
      'category',
      'specifications',
      'images',
      'isActive',
      'isFeatured',
    ];

    const productData = sanitizeInput(req.body, allowedFields);

    // Add creator
    productData.createdBy = req.user._id;

    const product = await Product.create(productData);

    await logProductAction('product_created', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: product._id,
      metadata: {
        productName: product.name,
        brand: product.brand,
        price: product.price,
      },
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

/**
 * @desc    Update product (admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Security: Sanitize input
    const allowedFields = [
      'name',
      'description',
      'brand',
      'model',
      'price',
      'currency',
      'stock',
      'category',
      'specifications',
      'images',
      'isActive',
      'isFeatured',
    ];

    const updates = sanitizeInput(req.body, allowedFields);

    // Track changes for audit log
    const changes = {};
    Object.keys(updates).forEach(key => {
      if (JSON.stringify(product[key]) !== JSON.stringify(updates[key])) {
        changes[key] = {
          old: product[key],
          new: updates[key],
        };
      }
    });

    // Apply updates
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    product.updatedBy = req.user._id;
    await product.save();

    await logProductAction('product_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: product._id,
      metadata: {
        productName: product.name,
        changes: Object.keys(changes),
      },
    });

    const updatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete product (admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    await logProductAction('product_deleted', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: product._id,
      metadata: {
        productName: product.name,
        brand: product.brand,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

/**
 * @desc    Update product stock (admin only)
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const oldStock = product.stock;
    product.stock = stock;
    product.updatedBy = req.user._id;
    await product.save();

    await logProductAction('product_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: product._id,
      metadata: {
        productName: product.name,
        action: 'stock_update',
        oldStock,
        newStock: stock,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product stock',
      error: error.message,
    });
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(limit * 1)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products',
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
};
