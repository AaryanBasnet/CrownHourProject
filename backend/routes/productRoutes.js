const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
} = require('../controllers/productController');
const { getMensProducts, getWomensProducts } = require('../controllers/genderProductController');
const { protect, restrictTo } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * Product Routes
 * 
 * Security:
 * - Public routes: GET products (with rate limiting)
 * - Admin-only routes: CREATE, UPDATE, DELETE
 * - Input validation at controller level
 */

// Public routes
router.get('/', authLimiter, getProducts);
router.get('/filters/options', authLimiter, getFilterOptions);
router.get('/men', authLimiter, getMensProducts);
router.get('/women', authLimiter, getWomensProducts);
router.get('/slug/:slug', authLimiter, getProductBySlug); // SEO-friendly slug route
router.get('/:id/related', authLimiter, getRelatedProducts); // Related products
router.get('/:id', authLimiter, getProductById);

// Protected Admin routes
router.post('/', protect, restrictTo('admin'), createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;
