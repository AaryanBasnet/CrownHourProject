import apiClient from '@api/axios';

/**
 * Product Service
 * Handles all product-related API calls
 * 
 * Security:
 * - All requests go through axios interceptor
 * - Query params are properly encoded
 * - No sensitive data in URLs
 */

export const productService = {
  /**
   * Get products with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with products and pagination
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise} Response with product data
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get filter options (categories, movements, etc.)
   * @returns {Promise} Response with filter options
   */
  getFilterOptions: async () => {
    const response = await apiClient.get('/products/filters/options');
    return response.data;
  },

  /**
   * Create new product (Admin only)
   * @param {Object} productData - Product data
   * @returns {Promise} Response with created product
   */
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  /**
   * Update product (Admin only)
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} Response with updated product
   */
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product (Admin only)
   * @param {string} id - Product ID
   * @returns {Promise} Response
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Get product by slug (SEO-friendly)
   * @param {string} slug - Product slug
   * @returns {Promise} Response with product data
   */
  getProductBySlug: async (slug) => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  /**
   * Get related products
   * @param {string} id - Product ID
   * @param {number} limit - Number of related products
   * @returns {Promise} Response with related products
   */
  getRelatedProducts: async (id, limit = 4) => {
    const response = await apiClient.get(`/products/${id}/related`, { params: { limit } });
    return response.data;
  },
};
