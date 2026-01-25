import { useAuthStore } from '@store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@services';

/**
 * Custom hook for authentication operations
 * Provides convenient access to auth state and actions
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      // Check if MFA is required
      if (response.mfaRequired) {
        navigate('/mfa-verify', {
          state: {
            email: credentials.email,
            password: credentials.password
          }
        });
        return { mfaRequired: true };
      }

      // No MFA, proceed with login
      if (response.data?.user) {
        authStore.setAuth(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear React Query cache to prevent data leaks
    queryClient.clear();
    // Clear Zustand auth state
    authStore.logout();
    // Redirect to login
    navigate('/login');
  };

  return {
    // State
    isLoggedIn: authStore.isLoggedIn,
    user: authStore.user,
    role: authStore.role,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Actions
    login,
    register,
    logout,
    checkAuth: authStore.checkAuth,
    setAuth: authStore.setAuth,
    clearError: authStore.clearError,
  };
};
