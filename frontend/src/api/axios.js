import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Important for Cookies
});

// Request Interceptor: Inject CSRF Token from Storage
apiClient.interceptors.request.use((config) => {
  const csrfToken = localStorage.getItem('csrf-token');
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Skip retry for auth endpoints where 401 is expected
    // Don't retry: login, register, logout, verify, password reset, etc.
    const authEndpoints = [
      '/auth/me',
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/auth/verify',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/mfa',
    ];

    const isAuthEndpoint = authEndpoints.some(endpoint =>
      originalRequest.url.includes(endpoint)
    );

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // 2. Handle Unauthorized (401) - Indicates session expired
    if (error.response?.status === 401) {
      // Avoid infinite loops
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      // In a real app with Refresh Tokens, you would attempt a refresh here.
      // Since we use 2-min hard sessions for testing/security:

      // 1. Clear frontend auth state
      import('@store/authStore').then(async (module) => {
        const { useAuthStore } = module;
        await useAuthStore.getState().logout();

        // 2. Redirect to login with reason
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?reason=session_expired';
        }
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;