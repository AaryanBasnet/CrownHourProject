const express = require("express");
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
  getBackupCodes,
  regenerateBackupCodes,
  changePassword,
  verifyRegistrationOtp,
  handleGoogleCallback,
  exchangeOAuthToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const passport = require("passport");
const { protect } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateForgotPassword,
  validateResetPassword,
} = require("../middleware/validateInput");
const {
  authLimiter,
  createAccountLimiter,
  passwordResetLimiter,
  oauthExchangeLimiter,
} = require("../middleware/rateLimiter");

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
router.post("/register", createAccountLimiter, validateRegistration, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/verify-otp", authLimiter, verifyRegistrationOtp); // Protected by strict auth limiter (5 attempts)
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword,
);
router.put(
  "/reset-password/:token",
  passwordResetLimiter,
  validateResetPassword,
  resetPassword,
);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  handleGoogleCallback,
);

// OAuth Token Exchange (One-Time Token Pattern)
// Security: Allows sameSite: 'strict' cookies while maintaining OAuth
// Strict rate limiting: 10 attempts per 5 minutes
router.post("/exchange-oauth-token", oauthExchangeLimiter, exchangeOAuthToken);

// Protected routes
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll); // High: Token versioning
router.get("/me", protect, getMe);
router.put("/password", protect, validatePasswordChange, changePassword);

// MFA routes
router.post("/mfa/enable", protect, enableMFA);
router.post("/mfa/verify", protect, verifyMFA);
router.post("/mfa/disable", protect, disableMFA);
router.get("/mfa/backup-codes", protect, getBackupCodes);
router.post("/mfa/regenerate-backup-codes", protect, regenerateBackupCodes);

module.exports = router;
