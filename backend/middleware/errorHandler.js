/**
 * Error Handling Middleware
 * Centralized error handling for Express application
 *
 * Security:
 * - Prevents sensitive error details from leaking to client
 * - Provides consistent error response format
 * - Logs errors for monitoring
 */

/**
 * Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Default status code to 500 if not set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Security: Only show stack trace in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error (but not sensitive details)
  console.error('Error:', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    // Don't log full stack in production
    ...(isDevelopment && { stack: err.stack }),
  });

  // Handle specific error types
  let message = err.message;

  // MongoDB duplicate key error
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    res.status(400);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
    res.status(400);
  }

  // MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    res.status(400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    res.status(401);
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    res.status(401);
  }

  // Send error response
  res.status(res.statusCode || 500).json({
    success: false,
    message,
    // Security: Only include stack trace in development
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
