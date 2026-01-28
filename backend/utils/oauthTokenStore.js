/**
 * OAuth Temporary Token Store
 *
 * Security:
 * - One-time use tokens for OAuth callback
 * - 60-second TTL to prevent token replay
 * - Automatic cleanup of expired tokens
 * - Tokens are burned after single use
 *
 * This allows sameSite: 'strict' cookies while maintaining OAuth functionality
 */

class OAuthTokenStore {
  constructor() {
    this.tokens = new Map();
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
  }

  /**
   * Generate and store a one-time OAuth token
   * @param {Object} userData - User data to associate with token
   * @returns {string} One-time token
   */
  generateToken(userData) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    const tokenData = {
      userData,
      expiresAt: Date.now() + (60 * 1000), // 60 seconds
      used: false,
    };

    this.tokens.set(token, tokenData);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OAuth Token Store] Generated token: ${token.substring(0, 10)}...`);
      console.log(`[OAuth Token Store] Expires at: ${new Date(tokenData.expiresAt).toISOString()}`);
    }

    return token;
  }

  /**
   * Validate and consume a one-time token
   * @param {string} token - Token to validate
   * @returns {Object|null} User data if valid, null if invalid/expired/used
   */
  consumeToken(token) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth Token Store] Token not found: ${token?.substring(0, 10)}...`);
      }
      return null;
    }

    // Check if expired
    if (Date.now() > tokenData.expiresAt) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth Token Store] Token expired: ${token.substring(0, 10)}...`);
      }
      this.tokens.delete(token);
      return null;
    }

    // Check if already used
    if (tokenData.used) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth Token Store] Token already used (replay attack?): ${token.substring(0, 10)}...`);
      }
      this.tokens.delete(token);
      return null;
    }

    // Mark as used and delete immediately (single use)
    this.tokens.delete(token);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OAuth Token Store] Token consumed successfully: ${token.substring(0, 10)}...`);
    }

    return tokenData.userData;
  }

  /**
   * Clean up expired tokens
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[OAuth Token Store] Cleaned up ${cleaned} expired tokens`);
    }
  }

  /**
   * Get current token count (for monitoring)
   */
  getTokenCount() {
    return this.tokens.size;
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
const oauthTokenStore = new OAuthTokenStore();

module.exports = oauthTokenStore;
