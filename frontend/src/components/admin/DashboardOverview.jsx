import { useDashboardStats } from '../../hooks/useAdmin';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    Clock,
    Award,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { AdminStatCard, AdminPageHeader, AdminCard, AdminBadge } from './common/AdminComponents';

/**
 * Dashboard Overview Component
 * Luxury Light Theme Implementation with Tailwind CSS
 */

const DashboardOverview = () => {
    const { data, isLoading, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const { overview, recentOrders, lowStockProducts, topProducts } = data;

    const stats = [
        {
            title: 'Total Users',
            value: overview.totalUsers.toLocaleString(),
            icon: Users,
            color: 'blue',
            link: '/admin/users',
        },
        {
            title: 'Total Products',
            value: overview.totalProducts.toLocaleString(),
            icon: Package,
            color: 'purple',
            link: '/admin/products',
        },
        {
            title: 'Total Orders',
            value: overview.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: 'green',
            link: '/admin/orders',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(overview.totalRevenue),
            icon: DollarSign,
            color: 'gold',
            subtitle: `${overview.revenueGrowth > 0 ? '+' : ''}${overview.revenueGrowth.toFixed(1)}% vs last month`,
            trend: overview.revenueGrowth,
        },
    ];

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <AdminPageHeader
                title="Dashboard Overview"
                description="Welcome back! Here's what's happening with your store."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <AdminStatCard
                        key={stat.title}
                        {...stat}
                        to={stat.link}
                    />
                ))}
            </div>

            {/* Pending Orders Alert */}
            {overview.pendingOrders > 0 && (
                <Link
                    to="/admin/orders?status=pending"
                    className="flex items-center gap-4 p-4 mb-8 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
                >
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">Action Required</p>
                        <p className="text-sm text-amber-900/80">
                            You have <strong>{overview.pendingOrders}</strong> pending orders that need attention.
                        </p>
                    </div>
                    <ArrowRight size={20} className="text-amber-400" />
                </Link>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <AdminCard className="h-full">
                        <div className="p-6 border-b border-[#C9A962]/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold font-serif text-gray-900">Recent Orders</h2>
                            <Link to="/admin/orders" className="text-sm font-medium text-[#C9A962] hover:text-[#E8D5A3]">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            {recentOrders.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-[#FAF8F5] text-xs uppercase text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Order #</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#C9A962]/10">
                                        {recentOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-[#FAF8F5]/50 transition-colors text-sm">
                                                <td className="px-6 py-4 font-medium">
                                                    <Link to={`/admin/orders/${order._id}`} className="hover:text-[#C9A962]">
                                                        {order.orderNumber}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {order.user?.firstName} {order.user?.lastName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <AdminBadge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                                                        {order.status}
                                                    </AdminBadge>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    {formatCurrency(order.pricing.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">No recent orders</div>
                            )}
                        </div>
                    </AdminCard>
                </div>

                {/* Right Column Stack */}
                <div className="flex flex-col gap-8">
                    {/* Low Stock Alert */}
                    <AdminCard>
                        <div className="p-6 border-b border-[#C9A962]/10">
                            <h2 className="text-lg font-bold font-serif text-gray-900 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-red-500" />
                                Low Stock Alert
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((product) => (
                                    <div key={product._id} className="p-4 flex items-center gap-4 hover:bg-[#FAF8F5]/50 transition-colors">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-[#C9A962]/20"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.brand}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                {product.stock} left
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    All products well stocked
                                </div>
                            )}
                        </div>
                    </AdminCard>

                    {/* Top Products */}
                    <AdminCard>
                        <div className="p-6 border-b border-[#C9A962]/10">
                            <h2 className="text-lg font-bold font-serif text-gray-900 flex items-center gap-2">
                                <Award size={20} className="text-[#C9A962]" />
                                Top Selling
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {topProducts.length > 0 ? (
                                topProducts.map((item, index) => (
                                    <div key={item._id} className="p-4 flex items-center gap-4 hover:bg-[#FAF8F5]/50 transition-colors">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.totalSold} sold</p>
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {formatCurrency(item.revenue)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No sales data yet
                                </div>
                            )}
                        </div>
                    </AdminCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
