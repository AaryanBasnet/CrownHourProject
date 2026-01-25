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

                set({ isLoading: true, error: null });
                try {
                    const response = await cartService.getCart();
                    const cart = response.data;
                    set({
                        cart,
                        items: cart.items,
                        count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                        subtotal: cart.subtotal,
                        isLoading: false
                    });
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addToCart: async (product, quantity = 1, variants = {}) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                set({ isLoading: true, error: null });

                // BACKEND MODE
                if (isLoggedIn) {
                    try {
                        const response = await cartService.addItem({
                            productId: product._id,
                            quantity,
                            color: variants.color,
                            strap: variants.strap
                        });
                        const cart = response.data;
                        set({
                            cart,
                            items: cart.items,
                            count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                            subtotal: cart.subtotal,
                            isLoading: false
                        });
                        return true;
                    } catch (error) {
                        set({ error: error.message, isLoading: false });
                        return false;
                    }
                }

                // GUEST MODE (Local)
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
                        get().fetchCart(); // Refresh from server
                        return true;
                    } catch (error) {
                        return false;
                    }
                }

                // Guest
                const newItems = get().items.filter(item => item._id !== itemId);
                const newCount = newItems.reduce((acc, item) => acc + item.quantity, 0);
                const newSubtotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                set({ items: newItems, count: newCount, subtotal: newSubtotal });
            },

            updateQuantity: async (itemId, quantity) => {
                const isLoggedIn = useAuthStore.getState().isLoggedIn;
                if (isLoggedIn) {
                    try {
                        await cartService.updateItem(itemId, quantity);
                        get().fetchCart();
                    } catch (error) {
                        console.error(error);
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
