const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const { logSecurityEvent } = require('../utils/auditLogger');

/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks and abuse
 *
 * Security: Critical for preventing:
 * - Brute-force login attempts
 * - DDoS attacks
 * - API abuse
 */

// Log configuration on startup
const globalWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const globalMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
// IP blocking settings (separate from account locking)
const ipBlockWindowMs = parseInt(process.env.IP_BLOCK_DURATION) || 900000; // 15 minutes
const ipBlockMax = parseInt(process.env.IP_BLOCK_MAX_ATTEMPTS) || 20; // 20 total attempts

const accountLockMax = parseInt(process.env.ACCOUNT_LOCK_MAX_ATTEMPTS) || 5;
const accountLockDuration = parseInt(process.env.ACCOUNT_LOCK_DURATION) || 300000; // 5 minutes

console.log(`\n========================================`);
console.log(`[Security Configuration]`);
console.log(`  Global Rate Limit: ${globalMax} requests / ${globalWindowMs / 60000} minutes`);
console.log(`  IP Block: ${ipBlockMax} attempts / ${ipBlockWindowMs / 60000} minutes`);
console.log(`  Account Lock: ${accountLockMax} failed attempts / ${accountLockDuration / 60000} minutes lockout`);
console.log(`========================================\n`);

/**
 * General API rate limiter
 * Applies to all routes EXCEPT auth (auth has its own limiter)
 */
const apiLimiter = rateLimit({
  windowMs: globalWindowMs,
  max: globalMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use req.ip
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
  handler: async (req, res) => {
    console.log(`[GLOBAL LIMITER TRIGGERED] IP: ${req.ip}, Path: ${req.path}`);

    await logSecurityEvent('rate_limit_exceeded', {
      userId: req.user?._id,
      email: req.user?.email || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { path: req.path, method: req.method, limiter: 'global' },
      severity: 'medium',
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Blocks IP after continued abuse across all accounts
 * Separate from per-account locking - this blocks the IP itself
 */
const authLimiter = rateLimit({
  windowMs: ipBlockWindowMs,
  max: ipBlockMax,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again later',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  skip: (req) => {
    // Set SKIP_RATE_LIMIT=true in .env to disable rate limiting
    if (process.env.SKIP_RATE_LIMIT === 'true') {
      console.log('[AUTH LIMITER] Skipped (SKIP_RATE_LIMIT=true)');
      return true;
    }
    return false;
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use req.ip
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
  handler: async (req, res) => {
    console.log(`\n========================================`);
    console.log(`[IP BLOCKED] Too many login attempts from this IP`);
    console.log(`  IP: ${req.ip}`);
    console.log(`  Email: ${req.body?.email}`);
    console.log(`  Max Attempts: ${ipBlockMax}`);
    console.log(`  Block Duration: ${ipBlockWindowMs}ms (${ipBlockWindowMs / 60000} mins)`);
    console.log(`========================================\n`);

    await logSecurityEvent('rate_limit_exceeded', {
      email: req.body?.email || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { endpoint: 'auth', path: req.path, limiter: 'ip_block' },
      severity: 'high',
    });

    res.status(429).json({
      success: false,
      message: 'Too many attempts from this IP. Your IP has been temporarily blocked.',
    });
  },
});

/**
 * Rate limiter for password reset requests
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later',
  },
  handler: async (req, res) => {
    console.log(`[PASSWORD RESET LIMITER TRIGGERED] IP: ${req.ip}`);

    await logSecurityEvent('rate_limit_exceeded', {
      email: req.body?.email || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { endpoint: 'password_reset', limiter: 'password_reset' },
      severity: 'medium',
    });

    res.status(429).json({
      success: false,
      message: 'Too many password reset requests, please try again in an hour',
    });
  },
});

/**
 * Rate limiter for account creation
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 accounts per hour per IP
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again later',
  },
  handler: async (req, res) => {
    console.log(`[CREATE ACCOUNT LIMITER TRIGGERED] IP: ${req.ip}`);

    await logSecurityEvent('rate_limit_exceeded', {
      email: req.body?.email || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { endpoint: 'create_account', limiter: 'create_account' },
      severity: 'high',
    });

    res.status(429).json({
      success: false,
      message: 'Too many accounts created from this IP, please try again later',
    });
  },
});

/**
 * Rate limiter for upload operations
 * Prevents flooding Cloudinary with signed uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many upload requests, please try again later',
  },
  handler: async (req, res) => {
    console.log(`[UPLOAD LIMITER TRIGGERED] IP: ${req.ip}`);

    await logSecurityEvent('upload_rate_limit_exceeded', {
      userId: req.user?._id,
      email: req.user?.email || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { endpoint: 'upload_sign', path: req.path, limiter: 'upload' },
      severity: 'medium',
    });

    res.status(429).json({
      success: false,
      message: 'Too many upload requests, please try again later',
    });
  },
});

/**
 * OAuth Token Exchange Rate Limiter
 * Security: Prevents brute-force attacks on one-time token exchange
 * Stricter than normal auth since tokens are short-lived (60s)
 */
const oauthExchangeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 attempts per 5 minutes per IP
  message: {
    success: false,
    message: 'Too many OAuth token exchange attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    console.log(`[OAUTH EXCHANGE LIMITER] IP: ${req.ip}`);

    await logSecurityEvent('rate_limit_oauth_exchange', {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { limiter: 'oauth_exchange' },
      severity: 'high',
    });

    res.status(429).json({
      success: false,
      message: 'Too many OAuth token exchange attempts. Please try again in 5 minutes.',
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  createAccountLimiter,
  uploadLimiter,
  oauthExchangeLimiter,
};
