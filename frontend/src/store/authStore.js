import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@api/axios';

/**
 * Authentication Store
 * Manages authentication state, user info, and role-based access
 *
 * Security Notes:
 * - JWT stored in HTTP-Only cookies (not accessible to JS)
 * - State only tracks isLoggedIn, user object, and role
 * - logout() explicitly clears state to prevent data leaks
 */

export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      isLoggedIn: false,
      user: null,
      role: null, // 'admin' | 'customer'
      isLoading: false,
      error: null,

      /**
       * Check authentication status
       * Called on app mount to verify session validity
       */
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/auth/me');
          const { user } = response.data.data;

          set({
            isLoggedIn: true,
            user: {
              id: user.id || user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              address: user.address,
              profilePicture: user.profilePicture, // Cloudinary image
              mfaEnabled: user.mfaEnabled,
            },
            role: user.role?.name || user.role,
            isLoading: false,
          });

          return true;
        } catch (error) {
          // If check-auth fails, user is not authenticated
          set({
            isLoggedIn: false,
            user: null,
            role: null,
            isLoading: false,
            error: null, // Don't show error for failed auth check
          });
        }
      },

      /**
       * Refresh user data silently (without global loading state)
       */
      refreshUser: async () => {
        try {
          const response = await apiClient.get('/auth/me');
          const { user } = response.data.data;

          set({
            user: {
              id: user.id || user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              address: user.address,
              profilePicture: user.profilePicture,
              mfaEnabled: user.mfaEnabled,
            },
            role: user.role?.name || user.role,
          });
          return true;
        } catch (error) {
          console.error('Failed to refresh user:', error);
          return false;
        }
      },

      /**
       * Login action
       * Updates state after successful login
       * Does NOT store tokens (handled by HTTP-Only cookies)
       */
      setAuth: (user) => {
        set({
          isLoggedIn: true,
          user: {
            id: user.id || user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            profilePicture: user.profilePicture,
            mfaEnabled: user.mfaEnabled,
          },
          role: user.role?.name || user.role,
          error: null,
        });
      },

      /**
       * Logout action
       * CRITICAL: Clears all auth state
       * Must be called when:
       * - User explicitly logs out
       * - 401 interceptor triggers
       * - Session expires
       */
      logout: async () => {
        // Call backend logout endpoint to clear cookies
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Ignore errors, logout locally anyway
        }

        // Clear Zustand state
        set({
          isLoggedIn: false,
          user: null,
          role: null,
          error: null,
        });

        // Clear React Query cache (must be done in App.jsx after logout)
        // This is handled by the component that calls logout
      },

      /**
       * Logout from all devices
       * Revokes all active sessions by incrementing tokenVersion
       */
      logoutAll: async () => {
        try {
          const { authService } = await import('../services/authService');
          await authService.logoutAll();
        } catch (error) {
          console.error('Logout all API call failed:', error);
          // Proceed with local logout anyway
        }

        // Clear Zustand state
        set({
          isLoggedIn: false,
          user: null,
          role: null,
          error: null,
        });
      },

      /**
       * Set error
       */
      setError: (error) => {
        set({ error, isLoading: false });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'crown-auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist minimal data (not sensitive tokens)
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        role: state.role,
      }),
    }
  )
);
