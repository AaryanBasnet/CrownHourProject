const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  logoutAll,
  getMe,
  enableMFA,
  verifyMFA,
  disableMFA,
  changePassword,
  verifyRegistrationOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
} = require('../middleware/validateInput');
const {
  authLimiter,
  createAccountLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');

/**
 * Authentication Routes
 * All routes call controllers - no logic in route files
 *
 * Security:
 * - Rate limiting applied to prevent brute-force attacks
 * - Input validation before reaching controllers
 * - Protected routes require JWT authentication
 */

// Public routes
router.post('/register', createAccountLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/verify-otp', authLimiter, verifyRegistrationOtp); // Protected by strict auth limiter (5 attempts)

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll); // High: Token versioning
router.get('/me', protect, getMe);
router.put('/password', protect, validatePasswordChange, changePassword);

// MFA routes
router.post('/mfa/enable', protect, enableMFA);
router.post('/mfa/verify', protect, verifyMFA);
router.post('/mfa/disable', protect, disableMFA);

module.exports = router;
