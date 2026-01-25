import apiClient from '@api/axios';

/**
 * Review Service
 * Handles all review-related API calls
 * 
 * Security:
 * - All requests go through axios interceptor
 * - Input sanitized on backend
 */

export const reviewService = {
    /**
     * Get reviews for a product
     * @param {string} productId - Product ID
     * @param {Object} params - Query parameters (page, limit, sort)
     * @returns {Promise} Response with reviews
     */
    getProductReviews: async (productId, params = {}) => {
        const response = await apiClient.get(`/reviews/product/${productId}`, { params });
        return response.data;
    },

    /**
     * Create a review
     * @param {Object} reviewData - { productId, title, comment, rating }
     * @returns {Promise} Response with created review
     */
    createReview: async (reviewData) => {
        const response = await apiClient.post('/reviews', reviewData);
        return response.data;
    },

    /**
     * Update a review
     * @param {string} id - Review ID
     * @param {Object} reviewData - Updated review data
     * @returns {Promise} Response with updated review
     */
    updateReview: async (id, reviewData) => {
        const response = await apiClient.put(`/reviews/${id}`, reviewData);
        return response.data;
    },

    /**
     * Delete a review
     * @param {string} id - Review ID
     * @returns {Promise} Response
     */
    deleteReview: async (id) => {
        const response = await apiClient.delete(`/reviews/${id}`);
        return response.data;
    },

    /**
     * Vote review as helpful
     * @param {string} id - Review ID
     * @returns {Promise} Response with updated vote count
     */
    voteHelpful: async (id) => {
        const response = await apiClient.post(`/reviews/${id}/helpful`);
        return response.data;
    },
};
