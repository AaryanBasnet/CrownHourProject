import apiClient from '@api/axios';

/**
 * Order Service
 * Handles all order-related API calls
 */

export const orderService = {
  /**
   * Get all orders for current user
   * Admin gets all orders, customers get their own
   * @returns {Promise} Response with orders array
   */
  getAllOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise} Response with order data
   */
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create new order
   * @param {Object} data - Order data
   * @returns {Promise} Response with created order
   */
  createOrder: async (data) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  /**
   * Update order status (Admin only)
   * @param {string} id - Order ID
   * @param {Object} data - Updated order data (status, etc.)
   * @returns {Promise} Response with updated order
   */
  updateOrder: async (id, data) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
  },

  /**
   * Cancel order
   * @param {string} id - Order ID
   * @returns {Promise}
   */
  cancelOrder: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
};
