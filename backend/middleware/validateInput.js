const {
  isValidEmail,
  validatePassword,
  isValidObjectId,
} = require("../utils/validation");

/**
 * Input Validation Middleware
 * Validates request data before processing
 *
 * Security: Input validation is the first line of defense
 * - Prevents invalid data from reaching controllers
 * - Reduces attack surface
 */

/**
 * Validate user registration input
 */
const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Check required fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: "Password does not meet requirements",
      errors: passwordValidation.errors,
    });
  }

  // Validate name lengths
  if (firstName.trim().length === 0 || lastName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "First name and last name cannot be empty",
    });
  }

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  next();
};

/**
 * Validate password change input
 */
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current password and new password",
    });
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: "New password does not meet requirements",
      errors: passwordValidation.errors,
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password",
    });
  }

  next();
};

/**
 * Validate product creation/update input
 */
const validateProduct = (req, res, next) => {
  const { name, description, brand, model, price, stock, category } = req.body;

  if (
    !name ||
    !description ||
    !brand ||
    !model ||
    price === undefined ||
    stock === undefined ||
    !category
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required product fields",
    });
  }

  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a positive number",
    });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  const validCategories = ["luxury", "sport", "casual", "smart", "vintage"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category",
    });
  }

  next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    next();
  };
};

/**
 * Validate order creation input
 */
const validateOrder = (req, res, next) => {
  const { items, shippingAddress, billingAddress, payment } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item",
    });
  }

  if (!shippingAddress || !billingAddress || !payment) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide shipping address, billing address, and payment details",
    });
  }

  // Validate each item
  for (const item of items) {
    if (!item.product || !item.quantity) {
      return res.status(400).json({
        success: false,
        message: "Each item must have product ID and quantity",
      });
    }

    if (!isValidObjectId(item.product)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID in order items",
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProduct,
  validateObjectId,
  validateOrder,
};
