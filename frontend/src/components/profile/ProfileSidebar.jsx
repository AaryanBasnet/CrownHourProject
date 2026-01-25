import { LayoutDashboard, ShoppingBag, MapPin, User, Heart, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const ProfileSidebar = ({ activeTab, onTabChange }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Order History', icon: ShoppingBag },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'details', label: 'Account Details', icon: User },
        { id: 'wishlist', label: 'My Wishlist', icon: Heart, path: '/wishlist' },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <aside className="w-full md:w-72 flex-shrink-0">
            <nav className="sticky top-32 flex flex-col gap-1">
                {navItems.map((item) => (
                    item.path ? (
                        <a
                            key={item.id}
                            href={item.path}
                            className="group flex items-center justify-between p-4 text-stone-500 hover:text-stone-900 border-b border-stone-100 transition-all duration-300"
                        >
                            <span className="flex items-center gap-3">
                                <item.icon size={18} />
                                {item.label}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </a>
                    ) : (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`group flex items-center justify-between p-4 border-b transition-all duration-300 w-full text-left ${activeTab === item.id
                                ? 'text-stone-900 font-medium border-crown-gold pl-6'
                                : 'text-stone-500 hover:text-stone-900 border-stone-100'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <item.icon size={18} />
                                {item.label}
                            </span>
                            <span className={`transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>→</span>
                        </button>
                    )
                ))}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 text-red-700 hover:text-red-800 transition-colors mt-4 text-left"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </nav>
        </aside>
    );
};

export default ProfileSidebar;
