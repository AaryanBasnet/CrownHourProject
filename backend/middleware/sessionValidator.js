/**
 * Session Validation Middleware
 * Enforces session timeout in addition to JWT authentication
 *
 * Security:
 * - Ensures sessions expire after idle timeout (configured in server.js)
 * - Works in conjunction with JWT-based auth
 * - Provides defense-in-depth by requiring both valid JWT and active session
 *
 * Usage:
 * Add this middleware after the `protect` middleware on routes that need
 * session timeout enforcement:
 * router.get('/endpoint', protect, requireActiveSession, controller);
 */

/**
 * Require active session
 * Must be used after protect middleware
 */
const requireActiveSession = (req, res, next) => {
  // Check if session exists and is properly initialized
  if (!req.session) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.',
      code: 'SESSION_EXPIRED',
    });
  }

  // Initialize session timestamp on first use
  if (!req.session.userId && req.user) {
    req.session.userId = req.user._id.toString();
    req.session.email = req.user.email;
    req.session.loginTime = new Date().toISOString();
  }

  // Validate that session user matches JWT user
  if (req.session.userId && req.user) {
    if (req.session.userId !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Session validation failed. Please login again.',
        code: 'SESSION_MISMATCH',
      });
    }
  }

  // Update last activity time
  req.session.lastActivity = new Date().toISOString();

  next();
};

/**
 * Destroy session
 * Helper function to clear session data
 */
const destroySession = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  requireActiveSession,
  destroySession,
};
