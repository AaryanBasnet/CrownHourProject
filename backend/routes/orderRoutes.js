const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
} = require("../controllers/orderController");
const { protect } = require("../../middleware/auth");
const { requirePermission } = require("../../middleware/rbac");
const {
  validateOrder,
  validateObjectId,
} = require("../../middleware/validateInput");

/**
 * Order Routes
 * All routes call controllers - no logic in route files
 *
 * Security:
 * - All routes require authentication
 * - Customers can only access their own orders
 * - Admins can access and manage all orders
 */

// Security: All order routes require authentication
router.use(protect);

// Create new order
router.post("/", validateOrder, createOrder);

// Get all orders (filtered by role in controller)
router.get("/", getAllOrders);

// Get specific order
router.get("/:id", validateObjectId("id"), getOrderById);

// Cancel order - own order or admin
router.put("/:id/cancel", validateObjectId("id"), cancelOrder);

// Admin-only routes
router.put(
  "/:id/status",
  validateObjectId("id"),
  requirePermission("update:orders"),
  updateOrderStatus,
);

router.put(
  "/:id/payment",
  validateObjectId("id"),
  requirePermission("update:orders"),
  updatePaymentStatus,
);

module.exports = router;
