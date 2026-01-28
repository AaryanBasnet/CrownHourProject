/**
 * OAuth State Token Store
 *
 * Security:
 * - Prevents CSRF attacks on OAuth flow
 * - State parameter validation per OWASP recommendations
 * - 5-minute TTL for state tokens
 * - Automatic cleanup
 *
 * OAuth CSRF Attack Prevention:
 * Without state validation, an attacker could initiate OAuth and trick
 * a victim into completing it, linking the attacker's account to the victim's session
 */

class OAuthStateStore {
  constructor() {
    this.states = new Map();
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate and store OAuth state token
   * @returns {string} State token
   */
  generateState() {
    const crypto = require('crypto');
    const state = crypto.randomBytes(32).toString('hex');

    const stateData = {
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      used: false,
    };

    this.states.set(state, stateData);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OAuth State] Generated state: ${state.substring(0, 10)}...`);
    }

    return state;
  }

  /**
   * Validate and consume state token
   * @param {string} state - State token to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateState(state) {
    if (!state) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[OAuth State] No state parameter provided');
      }
      return false;
    }

    const stateData = this.states.get(state);

    if (!stateData) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth State] State not found: ${state.substring(0, 10)}...`);
      }
      return false;
    }

    // Check if expired
    if (Date.now() > stateData.expiresAt) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth State] State expired: ${state.substring(0, 10)}...`);
      }
      this.states.delete(state);
      return false;
    }

    // Check if already used
    if (stateData.used) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OAuth State] State already used (CSRF attack?): ${state.substring(0, 10)}...`);
      }
      this.states.delete(state);
      return false;
    }

    // Mark as used and delete
    this.states.delete(state);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OAuth State] State validated: ${state.substring(0, 10)}...`);
    }

    return true;
  }

  /**
   * Clean up expired states
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [state, data] of this.states.entries()) {
      if (now > data.expiresAt) {
        this.states.delete(state);
        cleaned++;
      }
    }

    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[OAuth State] Cleaned up ${cleaned} expired states`);
    }
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
const oauthStateStore = new OAuthStateStore();

module.exports = oauthStateStore;
