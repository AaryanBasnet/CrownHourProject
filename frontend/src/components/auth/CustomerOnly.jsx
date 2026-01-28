import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

export const CustomerOnly = ({ children }) => {
    const { user, role, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    // If logged in as admin, redirect to admin dashboard (or unauthorized)
    if (user && role === 'admin') {
        // Redirect to admin dashboard as that is their "home"
        return <Navigate to="/admin" state={{ from: location }} replace />;
    }

    return children;
};
