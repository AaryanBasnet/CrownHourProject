const User = require('../models/User');
const Role = require('../models/Role');
const { logUserAction } = require('../utils/auditLogger');
const { sanitizeInput } = require('../utils/validation');
const { deleteImage } = require('../config/cloudinary');

/**
 * User Controller
 * Handles user management operations
 *
 * Security:
 * - Only admins can view/modify all users
 * - Users can only view/modify their own profile
 * - All user actions are logged
 * - Password is never returned in queries
 */

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        query.role = roleDoc._id;
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const users = await User.find(query)
      .populate('role', 'name')
      .select('-password -mfaSecret')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (own profile or admin)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name permissions')
      .select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private (own profile or admin)
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Security: Only allow updating specific fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'profilePicture'];
    const updates = sanitizeInput(req.body, allowedFields);

    // Track changes for audit log
    const changes = {};
    Object.keys(updates).forEach(key => {
      if (JSON.stringify(user[key]) !== JSON.stringify(updates[key])) {
        changes[key] = {
          old: user[key],
          new: updates[key],
        };
      }
    });

    // Apply updates
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    await logUserAction('profile_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: user._id,
      metadata: { changes },
    });

    const updatedUser = await User.findById(user._id)
      .populate('role')
      .select('-password -mfaSecret');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Security: Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    await logUserAction('user_deleted', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: user._id,
      metadata: { deletedEmail: user.email },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user role (admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required',
      });
    }

    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Security: Prevent changing your own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const newRole = await Role.findOne({ name: roleName });

    if (!newRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    const oldRoleName = user.role.name;
    user.role = newRole._id;
    await user.save();

    await logUserAction('user_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: user._id,
      metadata: {
        action: 'role_change',
        oldRole: oldRoleName,
        newRole: roleName,
      },
    });

    const updatedUser = await User.findById(user._id)
      .populate('role')
      .select('-password -mfaSecret');

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

/**
 * @desc    Activate/deactivate user (admin only)
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Security: Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    user.isActive = isActive;
    await user.save();

    await logUserAction('user_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: user._id,
      metadata: {
        action: 'status_change',
        newStatus: isActive ? 'active' : 'inactive',
      },
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user profile picture
 * @route   PUT /api/users/:id/profile-picture
 * @access  Private (own profile)
 */
const updateProfilePicture = async (req, res) => {
  try {
    const { url, publicId } = req.body;

    if (!url || !publicId) {
      return res.status(400).json({
        success: false,
        message: 'Image URL and public ID are required',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Security: Only allow updating own profile picture
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile picture',
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.publicId) {
      try {
        await deleteImage(user.profilePicture.publicId);
      } catch (err) {
        console.error('Failed to delete old profile picture:', err);
        // Continue even if deletion fails
      }
    }

    // Update profile picture
    user.profilePicture = { url, publicId };
    await user.save();

    await logUserAction('profile_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: user._id,
      metadata: { action: 'profile_picture_updated' },
    });

    const updatedUser = await User.findById(user._id)
      .populate('role')
      .select('-password -mfaSecret');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  updateProfilePicture,
};
