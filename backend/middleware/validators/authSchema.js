const { z } = require('zod');

/**
 * Zod Validation Schemas for Authentication
 *
 * Security Enhancement: High-Level Input Validation
 * - Strict schema validation prevents Mass Assignment attacks
 * - Strong password requirements enforce security policy
 * - Type-safe validation with detailed error messages
 *
 *  This demonstrates industry-standard input validation
 * using Zod's strict mode to strip unknown fields automatically.
 */

/**
 * Password validation rules
 * Enforces strong password policy:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

/**
 * Email validation schema
 */
const emailSchema = z.string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Registration Schema
 *
 * Security: .strict() prevents Mass Assignment attacks
 * - Only specified fields are allowed
 * - Extra fields are automatically stripped
 * - Prevents attackers from injecting role, isAdmin, etc.
 */
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
}).strict(); // Security: Prevents Mass Assignment by stripping extra fields

/**
 * Login Schema
 *
 * Security: Validates login credentials with optional MFA token
 */
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string()
    .length(6, 'MFA token must be 6 digits')
    .regex(/^\d{6}$/, 'MFA token must be numeric')
    .optional(),
}).strict();

/**
 * Password Change Schema
 *
 * Security: Requires current password for verification
 * Ensures new password meets strength requirements
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
}).strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * MFA Verification Schema
 */
const verifyMFASchema = z.object({
  token: z.string()
    .length(6, 'MFA token must be 6 digits')
    .regex(/^\d{6}$/, 'MFA token must be numeric'),
}).strict();

/**
 * MFA Disable Schema
 *
 * Security: Requires password confirmation to disable MFA
 */
const disableMFASchema = z.object({
  password: z.string().min(1, 'Password is required'),
}).strict();

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  verifyMFASchema,
  disableMFASchema,
};
