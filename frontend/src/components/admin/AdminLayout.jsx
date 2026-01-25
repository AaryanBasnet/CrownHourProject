import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Star,
    FileText,
    LogOut,
    Menu,
    X,
    Plus,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import DashboardOverview from './DashboardOverview';
import UsersManagement from '../../pages/admin/UsersManagement';
import OrdersManagement from '../../pages/admin/OrdersManagement';
import ProductsManagement from '../../pages/admin/ProductsManagement';
import ProductCreate from '../../pages/admin/ProductCreate';
import ProductEdit from '../../pages/admin/ProductEdit';
import ReviewsManagement from '../../pages/admin/ReviewsManagement';
import AuditLogs from '../../pages/admin/AuditLogs';

/**
 * Admin Layout Component
 * Luxury-themed admin dashboard with sidebar navigation
 * Matches the crown-black/crown-gold design system
 */

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="admin-sidebar-header">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h1 className="admin-logo">CrownHour</h1>
                            <p className="admin-subtitle">Admin Panel</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-text-muted hover:text-crown-gold transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="admin-user-details">
                            <p className="admin-user-name">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="admin-user-role">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="admin-logout-btn"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="admin-main">
                {/* Mobile Header */}
                <header className="admin-mobile-header">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="admin-menu-toggle"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="admin-mobile-title">CrownHour</h1>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* Page Content */}
                <main>
                    <Routes>
                        <Route index element={<DashboardOverview />} />
                        <Route path="users" element={<UsersManagement />} />
                        <Route path="products" element={<ProductsManagement />} />
                        <Route path="products/create" element={<ProductCreate />} />
                        <Route path="products/edit/:id" element={<ProductEdit />} />
                        <Route path="orders" element={<OrdersManagement />} />
                        <Route path="reviews" element={<ReviewsManagement />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
