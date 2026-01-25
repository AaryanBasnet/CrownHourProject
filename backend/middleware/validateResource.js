const { z } = require('zod');

/**
 * Zod Schema Validation Middleware
 *
 * Security Enhancement: High-Level Input Validation
 * - Uses Zod for runtime type checking and validation
 * - Prevents injection attacks through strict schema enforcement
 * - Strips unknown fields to prevent Mass Assignment attacks
 * - Provides detailed validation errors for debugging
 *
 *  This demonstrates defense-in-depth by adding
 * schema validation BEFORE the existing validation middleware.
 * Multiple layers of validation provide stronger security.
 *
 * Usage:
 *   router.post('/register',
 *     validateResource(registerSchema),
 *     validateRegistration,  // Existing validation can stay as backup
 *     register
 *   );
 */

/**
 * Validates request data against a Zod schema
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateResource = (schema) => {
  return async (req, res, next) => {
    try {
      // Security: Parse and validate request body against schema
      // .strict() mode in schemas will strip unknown fields
      const validatedData = await schema.parseAsync(req.body);

      // Replace request body with validated (and sanitized) data
      // This ensures only expected fields reach the controller
      req.body = validatedData;

      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during validation',
      });
    }
  };
};

module.exports = validateResource;
