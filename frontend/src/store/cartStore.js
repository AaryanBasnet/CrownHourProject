import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@services';
import { useAuthStore } from './authStore';

/**
 * Cart Store
 * Handles global cart state with backend sync and local persistence
 */
export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: null,
            items: [], // Flattened items for easier UI consumption
            count: 0,
            subtotal: 0,
            isLoading: false,
            error: null,

            // Fetch cart (Backend or Local?)
            // If logged in, we fetch from backend.
            // If guest, we just rely on persisted state (localStorage).
            fetchCart: async () => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                if (!isLoggedIn) return; // Keep local state

                // Prevent concurrent fetches during other cart operations
                if (get().isLoading) return;

                set({ isLoading: true, error: null });
                try {
                    const response = await cartService.getCart();
                    const cart = response.data;

                    // Defensive check
                    if (!cart || !Array.isArray(cart.items)) {
                        console.error('Invalid cart response from fetchCart:', response);
                        set({ isLoading: false });
                        return;
                    }

                    set({
                        cart,
                        items: cart.items,
                        count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                        subtotal: cart.subtotal || 0,
                        isLoading: false
                    });
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch cart';
                    console.error('Fetch cart error:', errorMessage);
                    set({ error: errorMessage, isLoading: false });
                }
            },

            addToCart: async (product, quantity = 1, variants = {}) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                console.log('[CartStore] addToCart called - isLoggedIn:', isLoggedIn, 'product:', product._id);
                set({ isLoading: true, error: null });

                // BACKEND MODE
                if (isLoggedIn) {
                    console.log('[CartStore] Using BACKEND mode');
                    try {
                        const response = await cartService.addItem({
                            productId: product._id,
                            quantity,
                            color: variants.color,
                            strap: variants.strap
                        });
                        const cart = response.data;

                        // Defensive check: ensure cart and items exist
                        if (!cart || !Array.isArray(cart.items)) {
                            console.error('Invalid cart response:', response);
                            set({ error: 'Invalid cart response', isLoading: false });
                            return false;
                        }

                        set({
                            cart,
                            items: cart.items,
                            count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                            subtotal: cart.subtotal || 0,
                            isLoading: false
                        });
                        return true;
                    } catch (error) {
                        // Extract error message from axios error or regular error
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
                        console.error('Add to cart error:', errorMessage, error);
                        set({ error: errorMessage, isLoading: false });
                        return false;
                    }
                }

                // GUEST MODE (Local)
                console.log('[CartStore] Using GUEST mode - no backend request');
                const currentItems = [...get().items];
                const existingIndex = currentItems.findIndex(item =>
                    item.product._id === product._id &&
                    item.color?.name === variants.color?.name &&
                    item.strap?.material === variants.strap?.material
                );

                let effectivePrice = product.price;
                if (variants.strap?.priceModifier) effectivePrice += variants.strap.priceModifier;

                if (existingIndex > -1) {
                    currentItems[existingIndex].quantity += quantity;
                    currentItems[existingIndex].price = effectivePrice;
                } else {
                    currentItems.push({
                        product, // full product object for display
                        quantity,
                        price: effectivePrice,
                        color: variants.color,
                        strap: variants.strap,
                        // Generate temporary ID for keying
                        _id: `temp_${Date.now()}`
                    });
                }

                const newCount = currentItems.reduce((acc, item) => acc + item.quantity, 0);
                const newSubtotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                set({
                    items: currentItems,
                    count: newCount,
                    subtotal: newSubtotal,
                    isLoading: false
                });
                return true;
            },

            removeFromCart: async (itemId) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;

                if (isLoggedIn) {
                    try {
                        const response = await cartService.removeItem(itemId);
                        const cart = response.data;
                        set({
                            cart,
                            items: cart.items,
                            count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                            subtotal: cart.subtotal
                        });
                        return true;
                    } catch (error) {
                        console.error('Remove from cart error:', error);
                        return false;
                    }
                }

                // Guest
                const newItems = get().items.filter(item => item._id !== itemId);
                const newCount = newItems.reduce((acc, item) => acc + item.quantity, 0);
                const newSubtotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                set({ items: newItems, count: newCount, subtotal: newSubtotal });
                return true;
            },

            updateQuantity: async (itemId, quantity) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                if (isLoggedIn) {
                    try {
                        const response = await cartService.updateItem(itemId, quantity);
                        const cart = response.data;
                        set({
                            cart,
                            items: cart.items,
                            count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                            subtotal: cart.subtotal
                        });
                    } catch (error) {
                        console.error('Update quantity error:', error);
                    }
                    return;
                }

                // Guest
                const currentItems = [...get().items];
                const index = currentItems.findIndex(item => item._id === itemId);
                if (index > -1) {
                    currentItems[index].quantity = quantity;
                    const newCount = currentItems.reduce((acc, item) => acc + item.quantity, 0);
                    const newSubtotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    set({ items: currentItems, count: newCount, subtotal: newSubtotal });
                }
            },

            clearCart: async () => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                if (isLoggedIn) await cartService.clearCart();
                set({ items: [], count: 0, subtotal: 0, cart: null });
            }
        }),
        {
            name: 'crown-cart-storage',
            // Only persist items if not logged in? 
            // Actually, we can always persist locally for speed, but rely on fetch for truth
            partialize: (state) => ({ items: state.items, count: state.count, subtotal: state.subtotal }),
        }
    )
);
