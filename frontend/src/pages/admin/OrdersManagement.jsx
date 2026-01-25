import { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useAdmin';
import { Eye, Package, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import {
    AdminPageHeader,
    AdminCard,
    AdminSearch,
    AdminFilter,
    AdminBadge,
    AdminButton,
    Pagination
} from '../../components/admin/common/AdminComponents';

/**
 * Orders Management Page
 * Admin page for managing customer orders
 * Luxury Light Theme Implementation
 */

const OrdersManagement = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const limit = 10;

    const { data, isLoading, error } = useOrders({ page, limit, search, status });
    const updateStatusMutation = useUpdateOrderStatus();

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStatus = formData.get('status');
        const note = formData.get('note');
        const trackingNumber = formData.get('trackingNumber');
        const shippingCarrier = formData.get('shippingCarrier');

        try {
            await updateStatusMutation.mutateAsync({
                orderId: selectedOrder._id,
                status: newStatus,
                note,
                trackingNumber,
                shippingCarrier,
            });
            setShowStatusModal(false);
            setSelectedOrder(null);
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-2xl font-bold mb-2">Error Loading Orders</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const orders = data?.orders || [];
    const pagination = data?.pagination || {};

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
    ];

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'confirmed': return 'primary';
            case 'processing': return 'primary';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            case 'refunded': return 'default';
            default: return 'default';
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <AdminPageHeader
                title="Orders Management"
                description="Manage customer orders and shipments"
            />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <AdminSearch
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by order number..."
                />

                <div className="flex gap-4">
                    <AdminFilter
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        options={statusOptions}
                        icon={Filter}
                    />
                </div>
            </div>

            {/* Orders Table */}
            <AdminCard>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-16 text-gray-500">
                            <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                            <p>Loading orders...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F5] border-b border-[#C9A962]/20">
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Order #</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Customer</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Items</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Total</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Status</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Date</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C9A962]/10">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-900">{order.orderNumber}</td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {order.user?.firstName} {order.user?.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500">{order.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">{order.items?.length || 0} items</td>
                                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(order.pricing?.total)}</td>
                                        <td className="py-4 px-6">
                                            <AdminBadge variant={getStatusVariant(order.status)}>
                                                {order.status}
                                            </AdminBadge>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                <AdminButton variant="text" to={`/admin/orders/${order._id}`} className="!p-2">
                                                    <Eye size={18} />
                                                </AdminButton>
                                                <AdminButton
                                                    variant="text"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="!p-2 text-[#C9A962]"
                                                    title="Update Status"
                                                >
                                                    <Package size={18} />
                                                </AdminButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center text-gray-500">
                            No orders found matching your search.
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={pagination.pages}
                        totalItems={pagination.total}
                        onNext={() => setPage(p => p + 1)}
                        onPrev={() => setPage(p => p - 1)}
                    />
                )}
            </AdminCard>

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#C9A962]/20 flex justify-between items-center">
                            <h2 className="text-xl font-serif font-bold text-gray-900">Update Order Status</h2>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleStatusUpdate}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="status" className="block text-sm font-semibold text-gray-900">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={selectedOrder.status}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10"
                                    >
                                        {statusOptions.filter(opt => opt.value).map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="trackingNumber" className="block text-sm font-semibold text-gray-900">Tracking Number</label>
                                    <input
                                        type="text"
                                        id="trackingNumber"
                                        name="trackingNumber"
                                        defaultValue={selectedOrder.trackingNumber || ''}
                                        placeholder="Enter tracking number"
                                        className="w-full px-4 py-3 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="shippingCarrier" className="block text-sm font-semibold text-gray-900">Shipping Carrier</label>
                                    <input
                                        type="text"
                                        id="shippingCarrier"
                                        name="shippingCarrier"
                                        defaultValue={selectedOrder.shippingCarrier || ''}
                                        placeholder="e.g., FedEx, UPS, DHL"
                                        className="w-full px-4 py-3 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="note" className="block text-sm font-semibold text-gray-900">Note (Optional)</label>
                                    <textarea
                                        id="note"
                                        name="note"
                                        rows="3"
                                        placeholder="Add a note about this status change"
                                        className="w-full px-4 py-3 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#C9A962]/10 flex justify-end gap-3 bg-[#FAF8F5]/50">
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancel
                                </AdminButton>
                                <AdminButton
                                    type="submit"
                                    variant="primary"
                                    disabled={updateStatusMutation.isLoading}
                                >
                                    {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                                </AdminButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;
