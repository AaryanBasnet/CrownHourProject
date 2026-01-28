import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { productService, orderService } from '@services';
import { LoadingSpinner } from '@components';
import { sanitizeHTML } from '@utils/sanitize';

/**
 * Admin Dashboard
 * Secure admin-only page for managing products and orders
 * Features overview statistics and data tables
 */
export const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders

  // Fetch data
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAllOrders(),
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];

  // Calculate statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock < 5).length;

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="min-h-screen bg-crown-black py-12">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-crown-gold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-crown-gray-light">
            Manage your CrownHour inventory and orders
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-8"
        >
          <div className="flex border-b border-crown-gold/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'overview'
                ? 'text-crown-gold border-b-2 border-crown-gold'
                : 'text-crown-gray hover:text-crown-gold-light'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'products'
                ? 'text-crown-gold border-b-2 border-crown-gold'
                : 'text-crown-gray hover:text-crown-gold-light'
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'orders'
                ? 'text-crown-gold border-b-2 border-crown-gold'
                : 'text-crown-gray hover:text-crown-gold-light'
                }`}
            >
              Orders
            </button>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard
              title="Total Products"
              value={totalProducts}
              icon={clockIcon}
              loading={productsLoading}
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={ordersIcon}
              loading={ordersLoading}
            />
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={revenueIcon}
              loading={ordersLoading}
            />
            <StatCard
              title="Low Stock Alerts"
              value={lowStockProducts}
              icon={alertIcon}
              loading={productsLoading}
              alert={lowStockProducts > 0}
            />
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-crown-gold">
                Product Management
              </h2>
              <button className="btn-gold py-2 px-4">
                Add New Product
              </button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-crown-gold/20">
                      <th className="text-left py-3 px-4 text-crown-gold">Name</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Brand</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Price</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Stock</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b border-crown-gold/10 hover:bg-white/5">
                        <td className="py-3 px-4 text-crown-gray-light">{product.name}</td>
                        <td className="py-3 px-4 text-crown-gray-light">{product.brand}</td>
                        <td className="py-3 px-4 text-crown-gold">${product.price.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`${product.stock < 5 ? 'text-orange-400' : 'text-crown-gray-light'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-serif font-bold text-crown-gold mb-6">
              Order Management
            </h2>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-crown-gold/20">
                      <th className="text-left py-3 px-4 text-crown-gold">Order ID</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Customer</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Total</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Status</th>
                      <th className="text-left py-3 px-4 text-crown-gold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-crown-gold/10 hover:bg-white/5">
                        <td className="py-3 px-4 text-crown-gray-light">{order._id.slice(-8)}</td>
                        <td className="py-3 px-4 text-crown-gray-light">{order.user?.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-crown-gold">${order.totalAmount?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-400">{order.status || 'Pending'}</span>
                        </td>
                        <td className="py-3 px-4 text-crown-gray-light">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-crown-gray py-12">No orders yet</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, loading, alert }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`glass-card p-6 ${alert ? 'border-orange-400/50' : ''}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-crown-gold/10 rounded-full">
        <div className="text-crown-gold" dangerouslySetInnerHTML={{ __html: sanitizeHTML(icon) }} />
      </div>
    </div>
    <h3 className="text-crown-gray text-sm mb-1">{title}</h3>
    {loading ? (
      <LoadingSpinner size="sm" />
    ) : (
      <p className="text-3xl font-serif font-bold text-crown-gold">{value}</p>
    )}
  </motion.div>
);

// Icons
const clockIcon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
const ordersIcon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>';
const revenueIcon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
const alertIcon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
