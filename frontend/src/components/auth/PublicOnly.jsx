import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * Public-Only Route Component
 * Redirects authenticated users away from auth pages (login, register)
 * Prevents logged-in users from accessing login/register pages
 */
export const PublicOnly = ({ children }) => {
  const { isLoggedIn, role } = useAuthStore();

  if (isLoggedIn) {
    // Redirect based on role
    const destination = role === 'admin' ? '/admin' : '/shop';
    return <Navigate to={destination} replace />;
  }

  return children;
};
