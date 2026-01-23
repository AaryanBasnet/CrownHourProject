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
        'profile_updated',
        'email_verified',
        'product_created',
        'product_updated',
        'product_deleted',
        'order_created',
        'order_updated',
        'order_cancelled',
        'order_refunded',
        'payment_completed',
        'payment_failed',
        'unauthorized_access_attempt',
        'permission_denied',
        'suspicious_activity',
        'rate_limit_exceeded',
      ],
    },

    resource: {
      type: String,
      enum: ['user', 'product', 'order', 'auth', 'system'],
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
