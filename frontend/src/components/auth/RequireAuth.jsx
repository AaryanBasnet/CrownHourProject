import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * Route Guard Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves intended destination for redirect after login
 */
export const RequireAuth = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
