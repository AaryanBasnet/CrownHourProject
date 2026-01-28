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

    // Rotate CSRF Token if provided by backend (Max Security)
    if (response.data?.csrfToken) {
      apiClient.defaults.headers.common['x-csrf-token'] = response.data.csrfToken;
      localStorage.setItem('csrf-token', response.data.csrfToken);
    }

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
   * Logout from all devices
   * Revokes all active sessions by incrementing tokenVersion
   * @returns {Promise}
   */
  logoutAll: async () => {
    const response = await apiClient.post('/auth/logout-all');
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

  /**
   * Get MFA Backup Codes
   * @returns {Promise} Response with backup codes
   */
  getBackupCodes: async () => {
    const response = await apiClient.get('/auth/mfa/backup-codes');
    return response.data;
  },

  /**
   * Regenerate MFA Backup Codes
   * @param {string} password
   * @returns {Promise} Response with new backup codes
   */
  regenerateBackupCodes: async (password) => {
    const response = await apiClient.post('/auth/mfa/regenerate-backup-codes', { password });
    return response.data;
  },

  /**
   * Change Password
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise} Response
   */
  changePassword: async (data) => {
    const response = await apiClient.put('/auth/password', data);
    return response.data;
  },

  /**
   * Forgot Password
   * @param {string} email
   * @returns {Promise} Response
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset Password
   * @param {string} token
   * @param {string} password
   * @returns {Promise} Response
   */
  resetPassword: async (token, password) => {
    const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  /**
   * Get fresh CSRF token
   * @returns {Promise}
   */
  getCsrfToken: async () => {
    const response = await apiClient.get('/csrf-token');
    const { csrfToken } = response.data;

    // Update axios defaults and storage
    apiClient.defaults.headers.common['x-csrf-token'] = csrfToken;
    localStorage.setItem('csrf-token', csrfToken);

    return csrfToken;
  },

  /**
   * Exchange OAuth Token for JWT
   * Security: One-time token exchange pattern for sameSite: 'strict'
   * @param {string} oauthToken - One-time OAuth token from callback
   * @returns {Promise} Response with user data
   */
  exchangeOAuthToken: async (oauthToken) => {
    const response = await apiClient.post('/auth/exchange-oauth-token', { oauthToken });

    // Rotate CSRF Token if provided
    if (response.data?.csrfToken) {
      apiClient.defaults.headers.common['x-csrf-token'] = response.data.csrfToken;
      localStorage.setItem('csrf-token', response.data.csrfToken);
    }

    return response.data;
  },
};
