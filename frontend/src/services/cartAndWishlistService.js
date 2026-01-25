import apiClient from '@api/axios';

/**
 * Cart Service
 * Handles backend cart operations
 */
export const cartService = {
    getCart: async () => {
        const response = await apiClient.get('/cart');
        return response.data;
    },

    addItem: async (itemData) => {
        // itemData: { productId, quantity, color, strap }
        const response = await apiClient.post('/cart/add', itemData);
        return response.data;
    },

    updateItem: async (itemId, quantity) => {
        const response = await apiClient.put(`/cart/item/${itemId}`, { quantity });
        return response.data;
    },

    removeItem: async (itemId) => {
        const response = await apiClient.delete(`/cart/item/${itemId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await apiClient.delete('/cart');
        return response.data;
    }
};

/**
 * Wishlist Service
 * Handles backend wishlist operations
 */
export const wishlistService = {
    getWishlist: async () => {
        const response = await apiClient.get('/wishlist');
        return response.data;
    },

    toggleItem: async (productId) => {
        const response = await apiClient.post('/wishlist/toggle', { productId });
        return response.data;
    },

    checkStatus: async (productId) => {
        const response = await apiClient.get(`/wishlist/check/${productId}`);
        return response.data;
    }
};
