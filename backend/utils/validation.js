/**
 * Input Validation Utilities
 * Centralized validation functions for security
 *
 * Security: Input validation is critical for preventing:
 * - SQL/NoSQL injection
 * - XSS attacks
 * - Data integrity issues
 */

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { valid, errors }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} Whether phone is valid
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate MongoDB ObjectId
 * @param {String} id - ID to validate
 * @returns {Boolean} Whether ID is valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize string input to prevent XSS
 * @param {String} input - Input string
 * @returns {String} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize user input object
 * @param {Object} input - Input object
 * @param {Array} allowedFields - Array of allowed field names
 * @returns {Object} Sanitized object with only allowed fields
 */
const sanitizeInput = (input, allowedFields) => {
  const sanitized = {};

  allowedFields.forEach(field => {
    if (input.hasOwnProperty(field)) {
      const value = input[field];
      if (typeof value === 'string') {
        sanitized[field] = sanitizeString(value.trim());
      } else {
        sanitized[field] = value;
      }
    }
  });

  return sanitized;
};

/**
 * Validate price value
 * @param {Number} price - Price to validate
 * @returns {Boolean} Whether price is valid
 */
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0 && isFinite(price);
};

/**
 * Validate quantity
 * @param {Number} quantity - Quantity to validate
 * @returns {Boolean} Whether quantity is valid
 */
const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidObjectId,
  sanitizeString,
  sanitizeInput,
  isValidPrice,
  isValidQuantity,
};
