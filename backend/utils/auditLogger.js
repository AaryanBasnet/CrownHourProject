const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger Utility
 * Centralized logging for security-sensitive actions
 *
 * Security: All sensitive actions MUST be logged
 * - Authentication attempts
 * - Profile changes
 * - Admin actions
 * - Order transactions
 *
 * CRITICAL: Never log sensitive data like passwords, tokens, or full credit cards
 */

/**
 * Create audit log entry
 * @param {Object} params - Log parameters
 * @param {String} params.userId - User ID (optional for failed logins)
 * @param {String} params.email - User email
 * @param {String} params.action - Action performed
 * @param {String} params.resource - Resource type
 * @param {String} params.resourceId - Resource ID
 * @param {String} params.status - Action status (success/failure/error)
 * @param {String} params.ipAddress - Client IP address
 * @param {String} params.userAgent - Client user agent
 * @param {Object} params.metadata - Additional non-sensitive context
 * @param {String} params.errorMessage - Error message if failed
 * @param {String} params.severity - Log severity (low/medium/high/critical)
 */
const createAuditLog = async ({
  userId,
  email,
  action,
  resource,
  resourceId,
  status,
  ipAddress,
  userAgent,
  metadata = {},
  errorMessage,
  severity = 'low',
}) => {
  try {
    // Security: Validate required fields
    if (!action || !resource || !status || !ipAddress) {
      console.error('Missing required fields for audit log');
      return;
    }

    // Security: Sanitize metadata to ensure no sensitive data
    const sanitizedMetadata = sanitizeMetadata(metadata);

    const auditLog = new AuditLog({
      user: userId || null,
      email: email || 'unknown',
      action,
      resource,
      resourceId: resourceId || null,
      status,
      ipAddress,
      userAgent: userAgent || 'unknown',
      metadata: sanitizedMetadata,
      errorMessage: errorMessage || null,
      severity,
    });

    await auditLog.save();
  } catch (error) {
    // Critical: If audit logging fails, log to console but don't block the operation
    console.error('Failed to create audit log:', error.message);
  }
};

/**
 * Sanitize metadata to remove sensitive data
 * @param {Object} metadata - Metadata object
 * @returns {Object} Sanitized metadata
 */
const sanitizeMetadata = (metadata) => {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'cardNumber',
    'cvv',
    'ssn',
    'mfaSecret',
  ];

  const sanitized = { ...metadata };

  // Recursively check and remove sensitive fields
  const removeSensitiveData = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      // Remove field if it contains sensitive keywords
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        removeSensitiveData(obj[key]);
      }
    });
  };

  removeSensitiveData(sanitized);
  return sanitized;
};

/**
 * Log authentication event
 */
const logAuth = async (action, { userId, email, ipAddress, userAgent, status, errorMessage }) => {
  const severity = status === 'failure' ? 'medium' : 'low';

  await createAuditLog({
    userId,
    email,
    action,
    resource: 'auth',
    status,
    ipAddress,
    userAgent,
    errorMessage,
    severity,
  });
};

/**
 * Log user management event
 */
const logUserAction = async (action, { userId, email, ipAddress, userAgent, resourceId, metadata }) => {
  await createAuditLog({
    userId,
    email,
    action,
    resource: 'user',
    resourceId,
    status: 'success',
    ipAddress,
    userAgent,
    metadata,
    severity: 'medium',
  });
};

/**
 * Log product management event
 */
const logProductAction = async (action, { userId, email, ipAddress, userAgent, resourceId, metadata }) => {
  await createAuditLog({
    userId,
    email,
    action,
    resource: 'product',
    resourceId,
    status: 'success',
    ipAddress,
    userAgent,
    metadata,
    severity: 'low',
  });
};

/**
 * Log order event
 */
const logOrderAction = async (action, { userId, email, ipAddress, userAgent, resourceId, metadata }) => {
  await createAuditLog({
    userId,
    email,
    action,
    resource: 'order',
    resourceId,
    status: 'success',
    ipAddress,
    userAgent,
    metadata,
    severity: 'medium',
  });
};

/**
 * Log security event
 */
const logSecurityEvent = async (action, { userId, email, ipAddress, userAgent, metadata, severity = 'high' }) => {
  await createAuditLog({
    userId,
    email,
    action,
    resource: 'system',
    status: 'failure',
    ipAddress,
    userAgent,
    metadata,
    severity,
  });
};

module.exports = {
  createAuditLog,
  logAuth,
  logUserAction,
  logProductAction,
  logOrderAction,
  logSecurityEvent,
};
