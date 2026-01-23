const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateProduct, validateObjectId } = require('../middleware/validateInput');

/**
 * Product Routes
 * All routes call controllers - no logic in route files
 *
 * Security:
 * - Public routes for viewing products
 * - Admin-only routes for creating/updating/deleting
 * - Optional auth allows personalized product views
 */

// Public routes (with optional auth for personalization)
router.get("/", optionalAuth, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", validateObjectId("id"), optionalAuth, getProductById);

// Protected routes - admin only
router.post(
  "/",
  protect,
  requirePermission("create:products"),
  validateProduct,
  createProduct,
);

router.put(
  "/:id",
  validateObjectId("id"),
  protect,
  requirePermission("update:products"),
  validateProduct,
  updateProduct,
);

router.delete(
  "/:id",
  validateObjectId("id"),
  protect,
  requirePermission("delete:products"),
  deleteProduct,
);

router.patch(
  "/:id/stock",
  validateObjectId("id"),
  protect,
  requirePermission("update:products"),
  updateProductStock,
);

module.exports = router;
