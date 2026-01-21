const { z } = require('zod');

/**
 * Zod Validation Schemas for Products
 *
 * Security: Strict validation prevents malicious data injection
 */

/**
 * Product specifications schema
 */
const specificationsSchema = z.object({
  movement: z.enum(['automatic', 'quartz', 'mechanical', 'kinetic', 'solar']).optional(),
  caseMaterial: z.string().optional(),
  caseDiameter: z.string().optional(),
  waterResistance: z.string().optional(),
  strapMaterial: z.string().optional(),
  warranty: z.string().optional(),
}).optional();

/**
 * Product image schema
 */
const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * Product Creation/Update Schema
 *
 * Security: .strict() prevents injection of unauthorized fields
 */
const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name cannot exceed 200 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  brand: z.string()
    .min(1, 'Brand is required')
    .max(100, 'Brand cannot exceed 100 characters')
    .trim(),
  model: z.string()
    .min(1, 'Model is required')
    .max(100, 'Model cannot exceed 100 characters')
    .trim(),
  price: z.number()
    .positive('Price must be positive')
    .finite('Price must be a valid number'),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  stock: z.number()
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative'),
  category: z.enum(['luxury', 'sport', 'casual', 'smart', 'vintage']),
  specifications: specificationsSchema,
  images: z.array(imageSchema).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).strict();

/**
 * Stock update schema
 */
const updateStockSchema = z.object({
  stock: z.number()
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative'),
}).strict();

module.exports = {
  productSchema,
  updateStockSchema,
};
