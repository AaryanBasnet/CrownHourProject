const Stripe = require('stripe');

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
}

const Order = require('../models/Order');
const Product = require('../models/Product');
const { logOrderAction } = require('../utils/auditLogger');
const crypto = require('crypto');

/**
 * Order Controller
 * Handles order management and processing
 */

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, payment } = req.body;

    // Validate and process order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`,
        });
      }

      // Security: Validate stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          brand: product.brand,
          model: product.model,
          price: product.price,
          imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
        },
        quantity: item.quantity,
        priceAtPurchase: product.price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax (configurable)
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Determine initial status based on payment
    let paymentStatus = 'pending';
    let orderStatus = 'pending';
    let paidAt = null;

    if (payment && payment.transactionId && stripe) {
      try {
        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          paymentStatus = 'completed';
          orderStatus = 'confirmed';
          paidAt = new Date();

          // Security: Verify amount matches to prevent modification attacks
          const stripeAmount = paymentIntent.amount / 100;
          if (Math.abs(stripeAmount - total) > 1) { // Allow $1.00 margin for float/rounding differences
            console.error(`SECURITY ALERT: Payment amount mismatch! Order Total: ${total}, Stripe Paid: ${stripeAmount}. User: ${req.user._id}`);

            await logOrderAction('payment_mismatch_attempt', {
              userId: req.user._id,
              email: req.user.email,
              ipAddress: req.ip,
              metadata: { orderTotal: total, paidAmount: stripeAmount, transactionId: payment.transactionId }
            });

            return res.status(400).json({
              success: false,
              message: 'Payment verification failed: Amount mismatch. Order rejected.'
            });
          }

          paymentStatus = 'completed';
          orderStatus = 'confirmed';
          paidAt = new Date();
        } else {
          console.warn(`Payment verification failed for ${payment.transactionId}: Status is ${paymentIntent.status}`);
          return res.status(400).json({
            success: false,
            message: `Payment not completed. Status: ${paymentIntent.status}`
          });
        }
      } catch (stripeError) {
        console.error('Stripe verification error:', stripeError.message);
        // Fallback: If we can't verify, keep pending.
      }
    }

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      payment: {
        method: payment.method,
        status: paymentStatus,
        transactionId: payment.transactionId,
        cardLastFour: payment.cardLastFour || null,
        paidAt: paidAt
      },
      pricing: {
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
      },
      status: orderStatus,
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    await logOrderAction('order_created', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        itemCount: orderItems.length,
      },
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name brand model');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders (filtered by user role)
 * @route   GET /api/orders
 * @access  Private
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = {};

    // Security: Customers can only see their own orders
    if (req.user.role.name !== 'admin') {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name brand model')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name brand model images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Security: Customers can only view their own orders
    if (req.user.role.name !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status (admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const oldStatus = order.status;
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || null,
      updatedBy: req.user._id,
    });

    // Handle specific status changes
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
      if (note) {
        order.cancellationReason = note;
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    await logOrderAction('order_updated', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        action: 'status_change',
        oldStatus,
        newStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (own order or admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Security: Users can only cancel their own orders
    if (req.user.role.name !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Customer request';

    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Customer request',
      updatedBy: req.user._id,
    });

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    await logOrderAction('order_cancelled', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        reason: reason || 'Customer request',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
};

/**
 * @desc    Update payment status (admin only)
 * @route   PUT /api/orders/:id/payment
 * @access  Private/Admin
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required',
      });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const oldPaymentStatus = order.payment.status;
    order.payment.status = status;

    if (transactionId) {
      order.payment.transactionId = transactionId;
    }

    if (status === 'completed') {
      order.payment.paidAt = new Date();
      // Auto-confirm order when payment is completed
      if (order.status === 'pending') {
        order.status = 'confirmed';
      }
    }

    await order.save();

    await logOrderAction('payment_completed', {
      userId: req.user._id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      resourceId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        oldPaymentStatus,
        newPaymentStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
};
