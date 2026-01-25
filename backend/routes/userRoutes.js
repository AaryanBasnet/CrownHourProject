const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  updateProfilePicture,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requirePermission, requireRole, requireOwnership } = require('../middleware/rbac');
const { validateObjectId } = require('../middleware/validateInput');

/**
 * User Routes
 * All routes call controllers - no logic in route files
 *
 * Security:
 * - All routes require authentication
 * - RBAC enforced based on permissions
 * - Users can only access their own data unless admin
 */

// Security: All user routes require authentication
router.use(protect);

// Get all users - admin only
router.get('/', requirePermission('read:all_users'), getAllUsers);

// Get specific user - own profile or admin
router.get(
  '/:id',
  validateObjectId('id'),
  requireOwnership('id'),
  getUserById
);

// Update user - own profile or admin
router.put(
  '/:id',
  validateObjectId('id'),
  requireOwnership('id'),
  updateUser
);

// Update profile picture - own profile only
router.put(
  '/:id/profile-picture',
  validateObjectId('id'),
  requireOwnership('id'),
  updateProfilePicture
);

// Admin-only routes
router.delete(
  '/:id',
  validateObjectId('id'),
  requirePermission('delete:users'),
  deleteUser
);

router.put(
  '/:id/role',
  validateObjectId('id'),
  requirePermission('update:all_users'),
  updateUserRole
);

router.put(
  '/:id/status',
  validateObjectId('id'),
  requirePermission('update:all_users'),
  updateUserStatus
);

module.exports = router;
