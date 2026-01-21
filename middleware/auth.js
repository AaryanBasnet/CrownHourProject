const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/auditLogger');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 *
 * Security:
 * - Validates JWT token from Authorization header or cookies
 * - Ensures user exists and is active
 * - Logs unauthorized access attempts
 *
 * Further Enhancement: Token Versioning
 * - Validates token version matches current user's tokenVersion in DB
 * - Enables immediate session revocation when password changes or logout-all
 * - Prevents replay attacks with revoked tokens
 */

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Security: Check for token in Authorization header or HTTP-only cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // Log unauthorized access attempt
      await logSecurityEvent('unauthorized_access_attempt', {
        email: 'unknown',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { path: req.path, method: req.method },
      });

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and attach to request
      const user = await User.findById(decoded.id)
        .populate('role')
        .select('-password -mfaSecret');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Security: Check if user account is active
      if (!user.isActive) {
        await logSecurityEvent('unauthorized_access_attempt', {
          userId: user._id,
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: { reason: 'inactive_account' },
        });

        return res.status(401).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Security: Check if account is locked
      if (user.isLocked) {
        await logSecurityEvent('unauthorized_access_attempt', {
          userId: user._id,
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: { reason: 'account_locked' },
        });

        return res.status(401).json({
          success: false,
          message: 'Account is locked due to too many failed login attempts',
        });
      }

      // Security: Validate token version (Further Enhancement)
      // This enables immediate session revocation
      const tokenVersion = decoded.tokenVersion || 0;
      const userTokenVersion = user.tokenVersion || 0;

      if (tokenVersion !== userTokenVersion) {
        await logSecurityEvent('unauthorized_access_attempt', {
          userId: user._id,
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            reason: 'token_version_mismatch',
            tokenVersion,
            currentVersion: userTokenVersion
          },
        });

        return res.status(401).json({
          success: false,
          message: 'Token has been revoked. Please login again.',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Optional authentication - attach user if token exists but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
          .populate('role')
          .select('-password -mfaSecret');

        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid or expired, continue without user
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = { protect, optionalAuth };
