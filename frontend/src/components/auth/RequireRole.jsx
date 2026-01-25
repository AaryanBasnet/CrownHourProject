import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * Role-Based Access Control Component
 * Protects routes that require specific roles (e.g., admin)
 * Redirects to unauthorized page if user lacks required role
 */
export const RequireRole = ({ children, allowedRoles }) => {
  const { role } = useAuthStore();

  if (!allowedRoles.includes(role)) {
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
