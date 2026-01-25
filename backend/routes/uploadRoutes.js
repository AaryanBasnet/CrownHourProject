const express = require('express');
const router = express.Router();
const {
    signProductUpload,
    signProfileUpload,
    deleteUploadedImage,
    deleteProfileImage,
} = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

/**
 * Upload Routes
 * Handles Cloudinary signed upload signatures
 * 
 * Security:
 * - All routes require authentication
 * - Product uploads restricted to admins
 * - Profile uploads available to all authenticated users
 */

// Apply authentication to all routes
router.use(protect);

// Profile picture uploads - available to all authenticated users
router.post('/sign/profile', uploadLimiter, signProfileUpload);
router.delete('/delete-profile', deleteProfileImage);

// Product image uploads - admin only
router.post('/sign/product', restrictTo('admin'), uploadLimiter, signProductUpload);
router.delete('/delete', restrictTo('admin'), deleteUploadedImage);

module.exports = router;
