const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Records all security-sensitive actions for compliance and security monitoring
 *
 * Security: Critical for tracking:
 * - Authentication attempts (success/failure)
 * - Profile changes
 * - Order transactions
 * - Admin actions
 * - Suspicious activity
 *
 * NEVER log sensitive data like passwords or payment details
 */
const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required - some logs may be for failed login attempts with no valid user
  },
  email: {
    type: String,
    // Store email separately for failed login attempts
  },
  // What action was performed
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // Authentication events
      'login_success',
      'login_failure',
      'logout',
      'password_change',
      'password_reset_request',
      'password_reset_complete',
      'mfa_enabled',
      'mfa_disabled',
      'mfa_verify_success',
      'mfa_verify_failure',
      'account_locked',
      'account_unlocked',
      // User management
      'user_created',
      'user_updated',
      'user_deleted',
      'profile_updated',
      'email_verified',
      // Product management
      'product_created',
      'product_updated',
      'product_deleted',
      // Order events
      'order_created',
      'order_updated',
      'order_cancelled',
      'order_refunded',
      'payment_completed',
      'payment_failed',
      // Security events
      'unauthorized_access_attempt',
      'permission_denied',
      'suspicious_activity',
      'rate_limit_exceeded',
    ],
  },
  // Where the action occurred
  resource: {
    type: String,
    enum: ['user', 'product', 'order', 'auth', 'system'],
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    // ID of the affected resource (user, product, order, etc.)
  },
  // Result of the action
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'error'],
  },
  // Request metadata for security analysis
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  // Additional context (never store sensitive data here)
  metadata: {
    type: mongoose.Schema.Mixed,
    // Can store non-sensitive additional information
    // e.g., { oldValue: 'customer', newValue: 'admin' } for role changes
  },
  // Error details if action failed
  errorMessage: {
    type: String,
  },
  // Severity for security monitoring
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
}, {
  timestamps: true,
  // Use createdAt only, no updates to audit logs
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for efficient querying and security monitoring
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, severity: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

// Security: Prevent modification of audit logs
auditLogSchema.pre('updateOne', function(next) {
  next(new Error('Audit logs cannot be modified'));
});

auditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Audit logs cannot be modified'));
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
