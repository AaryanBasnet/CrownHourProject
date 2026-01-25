import apiClient from '@api/axios';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

export const authService = {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password }
   * @returns {Promise} Response with user data
   */
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password, mfaToken? }
   * @returns {Promise} Response with user data or mfaRequired flag
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   * Clears HTTP-Only cookies on backend
   * @returns {Promise}
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Check authentication status
   * @returns {Promise} Response with current user data
   */
  checkAuth: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token
   * @returns {Promise} Response
   */
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Verify OTP for registration
   * @param {string} email
   * @param {string} otp
   * @returns {Promise} Response
   */
  verifyOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  /**
   * Enable MFA (Get Secret & QR)
   * @returns {Promise} { secret, qrCode }
   */
  enableMFA: async () => {
    const response = await apiClient.post('/auth/mfa/enable');
    return response.data;
  },

  /**
   * Verify MFA Setup
   * @param {string} token
   * @returns {Promise} Response
   */
  verifyMFA: async (token) => {
    const response = await apiClient.post('/auth/mfa/verify', { token });
    return response.data;
  },

  /**
   * Disable MFA
   * @param {string} password
   * @returns {Promise} Response
   */
  disableMFA: async (password) => {
    const response = await apiClient.post('/auth/mfa/disable', { password });
    return response.data;
  },
};
