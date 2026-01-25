require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const { validateEnv } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

/**
 * CrownHour Backend Server
 * Secure MERN stack application for watch e-commerce
 */

// Validate environment variables
validateEnv();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security: Helmet middleware for HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
}));

// Security: CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
// Security: Stripe webhooks require raw body for signature verification
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next(); // Skip parsing for webhook
  } else {
    // Security: Limit payload size to prevent DoS (reduced from 10mb)
    express.json({ limit: '50kb' })(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.urlencoded({ extended: true, limit: '50kb' })(req, res, next);
  }
});

// Security: CSRF Protection via Origin Verification
// Prevents cross-origin state changes even if cookies are leaked
app.use((req, res, next) => {
  // Skip for non-state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for Stripe Webhook (server-to-server)
  if (req.originalUrl === '/api/payment/webhook') {
    return next();
  }

  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

  // In production, strictly enforce origin
  // In dev, allow Postman/Insomnia (which have no origin)
  if (!origin && process.env.NODE_ENV === 'development') {
    return next();
  }

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: 'CSRF Protection: Origin verification failed',
    });
  }

  next();
});

// Security: Prevent HTTP Parameter Pollution (HPP)
app.use(hpp());

// Cookie parser middleware
app.use(cookieParser());

// Security: Prevent NoSQL injection
app.use(mongoSanitize());

// Security: Prevent XSS attacks
app.use(xss());

// Security: Rate limiting on all routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ⚠️ VULNERABLE ROUTES - DISABLED FOR PRODUCTION SECURITY
// app.use('/api/vulnerable', require('./routes/vulnerableRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║           CrownHour Backend Server                    ║
║           Running in ${process.env.NODE_ENV || 'development'} mode                    ║
║           Port: ${PORT}                                   ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
