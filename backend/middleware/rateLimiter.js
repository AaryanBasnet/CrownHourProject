const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");
const { logSecurityEvent } = require("../utils/auditLogger");

/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks and abuse
 *
 * Security: Critical for preventing:
 * - Brute-force login attempts
 * - DDoS attacks
 * - API abuse
 */

/**
 * General API rate limiter
 * Applies to all routes
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Use MongoDB store for distributed rate limiting (optional)
  // store: new MongoStore({
  //   uri: process.env.MONGODB_URI,
  //   collectionName: 'rateLimits',
  // }),
  handler: async (req, res) => {
    // Log rate limit exceeded
    await logSecurityEvent("rate_limit_exceeded", {
      userId: req.user?._id,
      email: req.user?.email || "unknown",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { path: req.path, method: req.method },
      severity: "medium",
    });

    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later",
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force login attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS) || 5, // 5 attempts per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: async (req, res) => {
    await logSecurityEvent("rate_limit_exceeded", {
      email: req.body?.email || "unknown",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { endpoint: "auth", path: req.path },
      severity: "high",
    });

    res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts from this IP, please try again later",
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
    message: "Too many password reset requests, please try again later",
  },
  handler: async (req, res) => {
    await logSecurityEvent("rate_limit_exceeded", {
      email: req.body?.email || "unknown",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { endpoint: "password_reset" },
      severity: "medium",
    });

    res.status(429).json({
      success: false,
      message: "Too many password reset requests, please try again in an hour",
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
    message: "Too many accounts created from this IP, please try again later",
  },
  handler: async (req, res) => {
    await logSecurityEvent("rate_limit_exceeded", {
      email: req.body?.email || "unknown",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { endpoint: "create_account" },
      severity: "high",
    });

    res.status(429).json({
      success: false,
      message: "Too many accounts created from this IP, please try again later",
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  createAccountLimiter,
};
