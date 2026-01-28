const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Records security-sensitive actions for monitoring and compliance
 *
 * Security notes:
 * - Immutable by design
 * - No sensitive data stored
 * - Used for forensics and audit trails
 */
const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    email: {
      type: String,
    },

    action: {
      type: String,
      required: true,
      enum: [
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
        'user_created',
        'user_updated',
        'user_deleted',
        'user_status_updated',
        'profile_updated',
        'email_verified',
        'product_created',
        'product_updated',
        'product_deleted',
        'order_created',
        'order_updated',
        'order_cancelled',
        'order_refunded',
        'order_status_updated',
        'payment_completed',
        'payment_failed',
        'unauthorized_access_attempt',
        'permission_denied',
        'suspicious_activity',
        'rate_limit_exceeded',
        'rate_limit_oauth_exchange',
        'review_created',
        'review_updated',
        'review_deleted',
        'review_status_updated',
        'review_helpful_vote',
        'bot_login_attempt',
        'bot_register_attempt',
        'login_success_google',
        'oauth_callback_success',
        'oauth_callback_error',
        'oauth_exchange_success',
        'oauth_exchange_failed',
        'oauth_exchange_error',
        'search_queries',
        'upload_rate_limit_exceeded',
        'password_reset_success',
        'invalid_reset_token',
      ],
    },

    resource: {
      type: String,
      enum: ['user', 'product', 'order', 'auth', 'system', 'review'],
      required: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    status: {
      type: String,
      enum: ['success', 'failure', 'error'],
      required: true,
    },

    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed, // ✅ FIXED
      default: {},
    },

    errorMessage: {
      type: String,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, severity: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

// Prevent modification
auditLogSchema.pre('updateOne', function (next) {
  next(new Error('Audit logs cannot be modified'));
});

auditLogSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Audit logs cannot be modified'));
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
