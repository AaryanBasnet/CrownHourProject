import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Protected Route Component
 * Restricts access to authenticated users only
 * 
 * Security:
 * - Checks authentication status
 * - Redirects to login if not authenticated
 * - Optionally checks for admin role
 */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role?.name !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
