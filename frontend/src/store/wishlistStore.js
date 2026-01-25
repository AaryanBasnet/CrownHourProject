import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService } from '@services';
import { useAuthStore } from './authStore';

/**
 * Wishlist Store
 */
export const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [], // Array of products
            isLoading: false,
            error: null,

            fetchWishlist: async () => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                if (!isLoggedIn) return;

                set({ isLoading: true });
                try {
                    const response = await wishlistService.getWishlist();
                    set({ items: response.data.products, isLoading: false });
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            toggleWishlist: async (product) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;

                if (isLoggedIn) {
                    try {
                        const response = await wishlistService.toggleItem(product._id);
                        set({ items: response.data.products });
                        return true;
                    } catch (error) {
                        return false;
                    }
                }

                // GUEST MODE (Local only)
                const currentItems = [...get().items];
                const index = currentItems.findIndex(item => item._id === product._id);

                if (index > -1) {
                    currentItems.splice(index, 1);
                } else {
                    currentItems.push(product);
                }

                set({ items: currentItems });
                return true;
            },

            isInWishlist: (productId) => {
                return get().items.some(item => item._id === productId);
            }
        }),
        {
            name: 'crown-wishlist-storage',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
