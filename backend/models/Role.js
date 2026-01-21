const mongoose = require('mongoose');

/**
 * Role Model
 * Defines user roles for RBAC (Role-Based Access Control)
 *
 * Security: Roles determine what actions users can perform
 * - customer: Can browse products, place orders
 * - admin: Full access to all resources
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['customer', 'admin'],
    lowercase: true,
    trim: true,
  },
  permissions: [{
    type: String,
    enum: [
      'read:products',
      'create:orders',
      'read:own_orders',
      'update:own_profile',
      'read:all_users',
      'update:all_users',
      'delete:users',
      'create:products',
      'update:products',
      'delete:products',
      'read:all_orders',
      'update:orders',
      'delete:orders',
      'read:audit_logs',
    ],
  }],
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Role', roleSchema);
