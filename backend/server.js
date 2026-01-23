require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const { validateEnv } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

/**
 * CrownHour Backend Server
 * Secure MERN stack application for watch e-commerce
 *
 * Security Features:
 * - Helmet for HTTP headers security
 * - CORS configured for trusted origins
 * - NoSQL injection prevention
 * - Rate limiting
 * - HTTP-only cookies for JWT
 * - Input validation and sanitization
 * - Audit logging
 * - RBAC
 * - MFA support
 */

// Validate environment variables
validateEnv();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security: Helmet middleware for HTTP headers
app.use(helmet());

// Security: CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Security: Prevent NoSQL injection
app.use(mongoSanitize());

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

// These routes demonstrate security vulnerabilities for educational purposes
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
