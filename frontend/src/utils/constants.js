/**
 * Application Constants
 */

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5000/api';

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Dress',
  'Sport',
  'Diver',
  'Pilot',
  'Chronograph',
  'Smart',
  'Vintage',
];

// Order Statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

// Validation Constants
export const PASSWORD_MIN_LENGTH = 8;
export const MFA_CODE_LENGTH = 6;

// UI Constants
export const ITEMS_PER_PAGE = 12;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
