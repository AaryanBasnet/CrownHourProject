const { z } = require('zod');

/**
 * Zod Validation Schemas for Orders
 *
 * Security: Strict validation for order data
 */

/**
 * Address schema (used for shipping and billing)
 */
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  street: z.string().min(1, 'Street address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional(),
});

/**
 * Order item schema
 */
const orderItemSchema = z.object({
  product: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive'),
});

/**
 * Payment schema
 *
 * Security: Never store full card numbers, only last 4 digits
 */
const paymentSchema = z.object({
  method: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
  cardLastFour: z.string()
    .length(4, 'Card last 4 digits must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Card last 4 digits must be numeric')
    .optional(),
});

/**
 * Create Order Schema
 *
 * Security: .strict() prevents injection of unauthorized fields
 */
const createOrderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, 'Order must contain at least one item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  payment: paymentSchema,
}).strict();

/**
 * Update Order Status Schema
 */
const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ]),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
}).strict();

/**
 * Cancel Order Schema
 */
const cancelOrderSchema = z.object({
  reason: z.string()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
}).strict();

/**
 * Update Payment Status Schema
 */
const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  transactionId: z.string().optional(),
}).strict();

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  updatePaymentStatusSchema,
};
