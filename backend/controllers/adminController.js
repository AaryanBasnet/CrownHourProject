const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { logSecurityEvent } = require('../utils/auditLogger');

/**
 * Admin Controller
 * Handles all admin-specific operations
 * 
 * Security:
 * - All routes require admin role (enforced by middleware)
 * - All actions are logged in audit log
 * - Input validation on all operations
 * - Rate limiting applied
 */

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingOrders,
            recentOrders,
            lowStockProducts,
            topProducts,
        ] = await Promise.all([
            // Total users
            User.countDocuments(),

            // Total products
            Product.countDocuments({ isActive: true }),

            // Total orders
            Order.countDocuments(),

            // Total revenue
            Order.aggregate([
                { $match: { 'payment.status': 'completed' } },
                { $group: { _id: null, total: { $sum: '$pricing.total' } } },
            ]),

            // Pending orders
            Order.countDocuments({ status: 'pending' }),

            // Recent orders (last 10)
            Order.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('user', 'firstName lastName email')
                .select('orderNumber status pricing.total createdAt'),

            // Low stock products (stock < 10)
            Product.find({ stock: { $lt: 10 }, isActive: true })
                .select('name brand stock')
                .limit(10),

            // Top selling products
            Order.aggregate([
                { $match: { 'payment.status': 'completed' } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.product',
                        totalSold: { $sum: '$items.quantity' },
                        revenue: { $sum: '$items.subtotal' },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $project: {
                        name: '$product.name',
                        brand: '$product.brand',
                        totalSold: 1,
                        revenue: 1,
                    },
                },
            ]),
        ]);

        // Calculate revenue growth (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        'payment.status': 'completed',
                        createdAt: { $gte: thirtyDaysAgo },
                    },
                },
                { $group: { _id: null, total: { $sum: '$pricing.total' } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        'payment.status': 'completed',
                        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
                    },
                },
                { $group: { _id: null, total: { $sum: '$pricing.total' } } },
            ]),
        ]);

        const currentRevenue = currentPeriodRevenue[0]?.total || 0;
        const previousRevenue = previousPeriodRevenue[0]?.total || 0;
        const revenueGrowth = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    pendingOrders,
                    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                },
                recentOrders,
                lowStockProducts,
                topProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';

        // Build filter
        const filter = {};
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        const query = User.find(filter)
            .populate('role', 'name')
            .select('-password -mfaSecret -verificationOTP -passwordResetToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [users, total] = await Promise.all([
            query,
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('role', 'name permissions')
            .select('-password -mfaSecret -verificationOTP -passwordResetToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get user's order history
        const orders = await Order.find({ user: user._id })
            .select('orderNumber status pricing.total createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                user,
                orders,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value',
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.isActive = isActive;
        await user.save();

        // Log the action
        await logSecurityEvent('user_status_updated', {
            adminId: req.user._id,
            adminEmail: req.user.email,
            targetUserId: user._id,
            targetUserEmail: user.email,
            newStatus: isActive ? 'active' : 'inactive',
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
        }

        // Soft delete - deactivate instead of removing
        user.isActive = false;
        await user.save();

        // Log the action
        await logSecurityEvent('user_deleted', {
            adminId: req.user._id,
            adminEmail: req.user.email,
            targetUserId: user._id,
            targetUserEmail: user.email,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders with pagination and filtering
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
exports.getOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';
        const search = req.query.search || '';

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const query = Order.find(filter)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name brand')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [orders, total] = await Promise.all([
            query,
            Order.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order details
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name brand model images')
            .populate('statusHistory.updatedBy', 'firstName lastName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note, trackingNumber, shippingCarrier } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.status = status;
        if (note) {
            order.statusHistory.push({
                status,
                note,
                updatedBy: req.user._id,
            });
        }
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (shippingCarrier) order.shippingCarrier = shippingCarrier;

        if (status === 'delivered') {
            order.deliveredAt = new Date();
        } else if (status === 'cancelled') {
            order.cancelledAt = new Date();
        }

        await order.save();

        // Log the action
        await logSecurityEvent('order_status_updated', {
            adminId: req.user._id,
            adminEmail: req.user.email,
            orderId: order._id,
            orderNumber: order.orderNumber,
            newStatus: status,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all products with pagination and filtering
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const status = req.query.status || '';

        // Build filter
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) filter.category = category;
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        const query = Product.find(filter)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [products, total] = await Promise.all([
            query,
            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private/Admin
 */
exports.getAuditLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const eventType = req.query.eventType || ''; // Frontend sends 'eventType', backend maps to 'action'
        const search = req.query.search || '';

        const filter = {};
        if (eventType) {
            filter.action = eventType;
        }

        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } },
                { resource: { $regex: search, $options: 'i' } },
            ];

            // If search is a valid ObjectId, check resourceId and user ID
            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                filter.$or.push({ resourceId: search }, { user: search });
            }
        }

        const query = AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [logs, total] = await Promise.all([
            query,
            AuditLog.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews with pagination and filtering
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
exports.getReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';

        const filter = {};
        if (status === 'pending') filter.isApproved = false;
        if (status === 'approved') filter.isApproved = true;

        const query = Review.find(filter)
            .populate('user', 'firstName lastName email')
            .populate('product', 'name brand')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [reviews, total] = await Promise.all([
            query,
            Review.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve/reject review
 * @route   PATCH /api/admin/reviews/:id/approve
 * @access  Private/Admin
 */
exports.updateReviewStatus = async (req, res, next) => {
    try {
        const { isApproved } = req.body;

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isApproved must be a boolean value',
            });
        }

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        review.isApproved = isApproved;
        await review.save();

        // Log the action
        await logSecurityEvent('review_status_updated', {
            adminId: req.user._id,
            adminEmail: req.user.email,
            reviewId: review._id,
            newStatus: isApproved ? 'approved' : 'rejected',
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        await review.deleteOne();

        // Log the action
        await logSecurityEvent('review_deleted', {
            adminId: req.user._id,
            adminEmail: req.user.email,
            reviewId: review._id,
            ipAddress: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
