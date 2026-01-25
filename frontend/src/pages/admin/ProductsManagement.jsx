import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../../hooks/useAdmin';
import { Eye, Edit, Trash2, Plus, Filter, Box } from 'lucide-react';
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
 * Products Management Page
 * Admin page for managing product inventory
 * Luxury Light Theme Implementation
 */

const ProductsManagement = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const limit = 10;

    const { data, isLoading, error } = useProducts({
        page,
        limit,
        search,
        category,
        status,
    });

    const deleteProductMutation = useDeleteProduct();

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProductMutation.mutateAsync(productId);
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'luxury', label: 'Luxury' },
        { value: 'sport', label: 'Sport' },
        { value: 'casual', label: 'Casual' },
        { value: 'smart', label: 'Smart' },
        { value: 'vintage', label: 'Vintage' },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];

    const getStockBadgeVariant = (stock) => {
        if (stock < 10) return 'danger';
        if (stock < 20) return 'warning';
        return 'success';
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <AdminPageHeader
                title="Products Management"
                description="Manage your luxury timepiece inventory"
                action={
                    <AdminButton to="/admin/products/create">
                        <Plus size={18} />
                        Add Product
                    </AdminButton>
                }
            />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <AdminSearch
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by name, brand, or model..."
                />

                <div className="flex gap-4">
                    <AdminFilter
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                        options={categoryOptions}
                        icon={Filter}
                    />

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

            {/* Products Table */}
            <AdminCard>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-16 text-gray-500">
                            <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                            <p>Loading inventory...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F5] border-b border-[#C9A962]/20">
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Product</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Brand</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Category</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Price</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Stock</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Status</th>
                                    <th className="py-4 px-6 font-serif font-bold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C9A962]/10">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-[#C9A962]/20 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                        <Box size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">{product.brand}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="py-4 px-6">
                                            <AdminBadge variant={getStockBadgeVariant(product.stock)}>
                                                {product.stock} units
                                            </AdminBadge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <AdminBadge variant={product.isActive ? 'success' : 'danger'}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </AdminBadge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                <AdminButton variant="text" to={`/product/${product.slug}`} target="_blank" className="!p-2">
                                                    <Eye size={18} />
                                                </AdminButton>
                                                <AdminButton variant="text" to={`/admin/products/edit/${product._id}`} className="!p-2">
                                                    <Edit size={18} />
                                                </AdminButton>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={deleteProductMutation.isLoading}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center text-gray-500">
                            No products found matching your search.
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
        </div>
    );
};

export default ProductsManagement;
