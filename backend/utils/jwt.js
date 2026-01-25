const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 * Handles token generation and verification
 *
 * Security: JWT tokens are used for stateless authentication
 * - Tokens expire after configured time
 * - Tokens contain minimal user info (id, email, role)
 * - Never include sensitive data in tokens
 *
 * High Enhancement: Token Versioning
 * - Includes tokenVersion in JWT payload
 * - Enables immediate session revocation
 * - When user changes password/logs out everywhere, increment tokenVersion
 * - Auth middleware validates token version matches current DB version
 */

/**
 * Generate JWT token for authenticated user
 *
 * High Enhancement: Includes tokenVersion for session revocation
 * @param {Object} user - User object with tokenVersion
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    // Security: Include token version for revocation capability
    tokenVersion: user.tokenVersion || 0,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Generate refresh token with longer expiration
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh',
  };

  const options = {
    expiresIn: '30d',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
};
