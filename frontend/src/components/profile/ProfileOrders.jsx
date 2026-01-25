import { Loader2 } from 'lucide-react';

const ProfileOrders = ({ orders, loading }) => {

    if (loading) {
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-crown-gold animate-spin mb-4" />
                <p className="text-stone-500 text-sm tracking-widest uppercase">Loading Orders...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h2 className="font-display text-3xl mb-8 pb-4 border-b border-stone-200">Order History</h2>

            {orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-stone-800">
                                <th className="text-left py-4 text-xs uppercase tracking-widest text-stone-500 font-normal">Order</th>
                                <th className="text-left py-4 text-xs uppercase tracking-widest text-stone-500 font-normal">Date</th>
                                <th className="text-left py-4 text-xs uppercase tracking-widest text-stone-500 font-normal">Status</th>
                                <th className="text-left py-4 text-xs uppercase tracking-widest text-stone-500 font-normal">Total</th>
                                <th className="text-left py-4 text-xs uppercase tracking-widest text-stone-500 font-normal">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                                    <td className="py-6 font-display text-lg text-stone-900 group-hover:text-crown-gold transition-colors">
                                        {order.orderNumber}
                                    </td>
                                    <td className="py-6 text-stone-600 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-6">
                                        <span className={`
                                            inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-medium rounded-full
                                            ${order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                                order.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                                        'bg-stone-100 text-stone-600'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-6 font-medium text-stone-900">
                                        ${order.pricing?.total?.toFixed(2)}
                                    </td>
                                    <td className="py-6">
                                        <a href={`/orders/${order._id}`} className="text-stone-400 hover:text-stone-900 text-sm underline decoration-stone-200 underline-offset-4 transition-colors">
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-stone-50 border border-stone-100">
                    <p className="text-stone-500 mb-4">No orders found.</p>
                    <a href="/shop" className="text-crown-gold hover:text-crown-gold-dark text-sm uppercase tracking-widest border-b border-crown-gold pb-1">Start Shopping</a>
                </div>
            )}
        </div>
    );
};

export default ProfileOrders;
