import apiClient from '@api/axios';

/**
 * Gender-specific Product Service
 * Handles API calls for Men/Women product pages
 */

export const genderProductService = {
    /**
     * Get men's products with filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with products and pagination
     */
    getMensProducts: async (params = {}) => {
        const response = await apiClient.get('/products/men', { params });
        return response.data;
    },

    /**
     * Get women's products with filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with products and pagination
     */
    getWomensProducts: async (params = {}) => {
        const response = await apiClient.get('/products/women', { params });
        return response.data;
    },
};
