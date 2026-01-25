import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for Cookies
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Skip if the request is for the 'me' endpoint (Don't retry auth checks)
    if (originalRequest.url.includes('/auth/me')) {
      return Promise.reject(error);
    }

    // 2. Prevent infinite loops (Circuit Breaker)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried

      try {
        // Attempt to refresh token (if you have a refresh endpoint)
        // await apiClient.post('/auth/refresh-token');
        
        // Retry the original request exactly ONCE
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;