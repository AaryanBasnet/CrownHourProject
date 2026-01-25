const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getProducts,
    getAuditLogs,
    getReviews,
    updateReviewStatus,
    deleteReview,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

/**
 * Admin Routes
 * All routes require authentication and admin role
 * 
 * Security:
 * - Protected by JWT authentication
 * - Restricted to admin role only
 * - Input validation in controllers
 * - Rate limiting applied (configured in server.js)
 */

// Apply authentication and admin role to all routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users Management
router.get('/users', requirePermission('read:all_users'), getUsers);
router.get('/users/:id', requirePermission('read:all_users'), getUserById);
router.patch('/users/:id/status', requirePermission('update:all_users'), updateUserStatus);
router.delete('/users/:id', requirePermission('delete:users'), deleteUser);

// Orders Management
router.get('/orders', requirePermission('read:all_orders'), getOrders);
router.get('/orders/:id', requirePermission('read:all_orders'), getOrderById);
router.patch('/orders/:id/status', requirePermission('update:orders'), updateOrderStatus);

// Products Management
router.get('/products', requirePermission('read:products'), getProducts);

// Product CRUD - Admin only
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
router.post('/products', requirePermission('create:products'), createProduct);
router.put('/products/:id', requirePermission('update:products'), updateProduct);
router.delete('/products/:id', requirePermission('delete:products'), deleteProduct);

// Audit Logs
router.get('/audit-logs', requirePermission('read:audit_logs'), getAuditLogs);

// Reviews Management
router.get('/reviews', getReviews);
router.patch('/reviews/:id/approve', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
