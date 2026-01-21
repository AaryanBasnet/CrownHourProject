const { logSecurityEvent } = require('../utils/auditLogger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permission-based authorization
 *
 * Security: CRITICAL for preventing unauthorized actions
 * - Validates user has required permission
 * - Logs permission denied attempts
 * - Must be used AFTER auth middleware
 */

/**
 * Check if user has required permission
 * @param {String} permission - Required permission
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Security: Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Security: Ensure role is populated
      if (!req.user.role || !req.user.role.permissions) {
        await logSecurityEvent('permission_denied', {
          userId: req.user._id,
          email: req.user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            requiredPermission: permission,
            reason: 'no_role_or_permissions',
          },
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied: No permissions assigned',
        });
      }

      // Check if user has required permission
      const hasPermission = req.user.role.permissions.includes(permission);

      if (!hasPermission) {
        // Log permission denied
        await logSecurityEvent('permission_denied', {
          userId: req.user._id,
          email: req.user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            requiredPermission: permission,
            userPermissions: req.user.role.permissions,
            path: req.path,
            method: req.method,
          },
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization',
      });
    }
  };
};

/**
 * Check if user has any of the specified roles
 * @param  {...String} roles - Allowed role names
 */
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!req.user.role || !req.user.role.name) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No role assigned',
        });
      }

      const hasRole = roles.includes(req.user.role.name);

      if (!hasRole) {
        await logSecurityEvent('permission_denied', {
          userId: req.user._id,
          email: req.user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            requiredRoles: roles,
            userRole: req.user.role.name,
            path: req.path,
            method: req.method,
          },
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient role privileges',
        });
      }

      next();
    } catch (error) {
      console.error('Role check middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization',
      });
    }
  };
};

/**
 * Check if user is accessing their own resource
 * @param {String} paramName - Name of param containing user ID (default: 'id')
 */
const requireOwnership = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const resourceUserId = req.params[paramName];

      // Security: Admin can access all resources
      if (req.user.role && req.user.role.name === 'admin') {
        return next();
      }

      // Check ownership
      if (req.user._id.toString() !== resourceUserId) {
        await logSecurityEvent('permission_denied', {
          userId: req.user._id,
          email: req.user.email,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            reason: 'not_owner',
            resourceUserId,
            path: req.path,
            method: req.method,
          },
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources',
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization',
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireOwnership,
};
