require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectDB = require("./config/database");
const { validateEnv } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const { doubleCsrfProtection, generateCsrfToken } = require("./config/csrf");

// SSL Certificate Configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "certs", "localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "localhost.crt")),
  ca: fs.readFileSync(path.join(__dirname, "certs", "rootCA.pem")),
};

/**
 * CrownHour Backend Server
 * Secure MERN stack application for watch e-commerce
 */

// Validate environment variables
validateEnv();

// Initialize Express app
const app = express();

// Cookie parser middleware - MUST be before session for signed cookies
app.use(cookieParser(process.env.SESSION_SECRET));

// Session Configuration
// Security: Idle timeout of 2 minutes for testing
// Security: sameSite 'strict' enabled via one-time token exchange for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "session-secret-key",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    rolling: true, // Reset expiration on every request (idle timeout behavior)
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
      httpOnly: true, // Prevent XSS attacks
      secure: true, // Always secure with HTTPS
      sameSite: "strict", // ✅ Maximum CSRF protection (OAuth uses token exchange)
    },
    name: "sessionId", // Custom cookie name
    proxy: true, // Trust the reverse proxy
  }),
);

// CSRF Configuration moved to ./config/csrf.js

// Connect to MongoDB
connectDB();

// Security: Helmet middleware for HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://lh3.googleusercontent.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.cloudinary.com",
          "https://api.stripe.com",
          "https://www.google.com",
        ],
        frameSrc: ["'self'", "https://js.stripe.com", "https://www.google.com"],
      },
    },
  }),
);

// Security: CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
// Security: Stripe webhooks require raw body for signature verification
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next(); // Skip parsing for webhook
  } else {
    // Security: Limit payload size to prevent DoS (reduced from 10mb)
    express.json({ limit: "50kb" })(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next();
  } else {
    express.urlencoded({ extended: true, limit: "50kb" })(req, res, next);
  }
});

// Security: CSRF Protection via Origin Verification
// Prevents cross-origin state changes even if cookies are leaked
app.use((req, res, next) => {
  // Skip for non-state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip for Stripe Webhook (server-to-server)
  if (req.originalUrl === "/api/payment/webhook") {
    return next();
  }

  // Skip for OAuth token exchange (one-time token provides CSRF protection)
  if (req.originalUrl === "/api/auth/exchange-oauth-token") {
    return next();
  }

  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

  // Development flexibility: Allow both localhost and 127.0.0.1 variants
  let isAllowed = origin === allowedOrigin;
  if (!isAllowed && process.env.NODE_ENV === "development" && origin) {
    const localhostVariant = allowedOrigin.replace('localhost', '127.0.0.1');
    const ipVariant = allowedOrigin.replace('127.0.0.1', 'localhost');
    isAllowed = origin === localhostVariant || origin === ipVariant;
  }

  // In production, strictly enforce origin
  // In dev, allow Postman/Insomnia (which have no origin)
  if (!origin && process.env.NODE_ENV === "development") {
    return next();
  }

  if (!isAllowed) {
    console.log(
      `[Origin Check] Blocked: origin=${origin}, allowed=${allowedOrigin}`,
    );
    return res.status(403).json({
      success: false,
      message: "CSRF Protection: Origin verification failed",
    });
  }

  next();
});

// Security: Prevent HTTP Parameter Pollution (HPP)
app.use(hpp());

// (Moved up to line 29)
// app.use(cookieParser());

// Security: CSRF Token Route (Double Submit Cookie Pattern)
app.get("/api/csrf-token", (req, res) => {
  // Force session initialization by storing a value
  // This ensures a stable req.session.id for CSRF validation
  req.session.csrfInitialized = true;

  const token = generateCsrfToken(req, res);

  if (process.env.NODE_ENV === "development") {
    console.log(`[CSRF] Generated token for session: ${req.sessionID}`);
  }

  res.json({ csrfToken: token });
});

// Security: CSRF Protection Middleware
// Enforce CSRF token on all state-changing requests
app.use((req, res, next) => {
  // Skip Stripe Webhook
  if (req.originalUrl === "/api/payment/webhook") return next();

  // Skip OAuth token exchange (one-time token provides CSRF protection)
  // The exchange endpoint uses a cryptographically secure one-time token
  // that expires in 60 seconds and is burned after use, providing equivalent CSRF protection
  if (req.originalUrl === "/api/auth/exchange-oauth-token") return next();

  // Debugging CSRF
  if (process.env.NODE_ENV === "development") {
    console.log(`[CSRF] Checking ${req.method} ${req.originalUrl}`);
    console.log("[CSRF] Cookie (psid_csrf):", req.cookies["psid_csrf"]);
    console.log("[CSRF] Header (x-csrf-token):", req.headers["x-csrf-token"]);
    console.log("[CSRF] Session ID:", req.sessionID);
    if (!req.cookies["psid_csrf"])
      console.warn("[CSRF] WARNING: No CSRF cookie found");
    if (
      !req.headers["x-csrf-token"] &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)
    )
      console.warn("[CSRF] WARNING: No CSRF header found");
  }

  doubleCsrfProtection(req, res, next);
});

// Security: Prevent NoSQL injection
app.use(mongoSanitize());

// Security: Prevent XSS attacks
app.use(xss());

// Security: Rate limiting on all routes EXCEPT auth (auth has its own stricter limiter)
app.use("/api/", (req, res, next) => {
  // Skip global limiter for auth routes - they have their own specific limiters
  if (req.path.startsWith("/auth")) {
    return next();
  }
  return apiLimiter(req, res, next);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Session test endpoint (for development/testing)
// This endpoint helps verify the 2-minute idle timeout is working
app.get("/api/session-test", (req, res) => {
  if (!req.session) {
    return res.status(500).json({
      success: false,
      message: "Session not configured",
    });
  }

  // Initialize session data if it doesn't exist
  if (!req.session.createdAt) {
    req.session.createdAt = new Date().toISOString();
    req.session.requestCount = 0;
  }

  req.session.requestCount += 1;
  req.session.lastAccess = new Date().toISOString();

  // Calculate when session will expire (2 minutes from now)
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  res.json({
    success: true,
    message: "Session active",
    sessionId: req.sessionID,
    sessionData: {
      createdAt: req.session.createdAt,
      lastAccess: req.session.lastAccess,
      requestCount: req.session.requestCount,
      expiresAt: expiresAt,
      maxAge: req.session.cookie.maxAge,
      idleTimeoutMinutes: 2,
    },
    note: "Session will expire after 2 minutes of inactivity. Each request resets the timer.",
  });
});

// Passport Config
require("./config/passport");
const passport = require("passport");
app.use(passport.initialize());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// ⚠️ VULNERABLE ROUTES - DISABLED FOR PRODUCTION SECURITY
// app.use('/api/vulnerable', require('./routes/vulnerableRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start HTTPS server
const PORT = process.env.PORT || 5000;
const server = https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║           CrownHour Backend Server                    ║
║           Running in ${process.env.NODE_ENV || "development"} mode                    ║
║           HTTPS Enabled (SSL/TLS)                     ║
║           Port: ${PORT}                                   ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTPS server");
  server.close(() => {
    console.log("HTTPS server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = app;
