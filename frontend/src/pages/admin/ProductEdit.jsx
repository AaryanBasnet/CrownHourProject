import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import api from '../../api/axios';
import ProductImageUploader from '../../components/admin/ProductImageUploader';

/**
 * Product Edit Page
 * Edit existing products with full validation
 * Luxury theme with cream/champagne backgrounds
 */

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([{ url: '', alt: '', isPrimary: true }]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        brand: '',
        model: '',
        price: '',
        stock: '',
        category: 'luxury',
        currency: 'USD',
        specifications: {
            movement: 'automatic',
            caseMaterial: '',
            caseDiameter: '',
            waterResistance: '',
            strapMaterial: '',
            warranty: '',
            powerReserve: '',
            glass: '',
        },
        seo: {
            metaTitle: '',
            metaDescription: '',
        },
        isActive: true,
        isFeatured: false,
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            const product = response.data.data.product;

            setFormData({
                name: product.name || '',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                brand: product.brand || '',
                model: product.model || '',
                price: product.price || '',
                stock: product.stock || '',
                category: product.category || 'luxury',
                currency: product.currency || 'USD',
                specifications: {
                    movement: product.specifications?.movement || 'automatic',
                    caseMaterial: product.specifications?.caseMaterial || '',
                    caseDiameter: product.specifications?.caseDiameter || '',
                    waterResistance: product.specifications?.waterResistance || '',
                    strapMaterial: product.specifications?.strapMaterial || '',
                    warranty: product.specifications?.warranty || '',
                    powerReserve: product.specifications?.powerReserve || '',
                    glass: product.specifications?.glass || '',
                },
                seo: {
                    metaTitle: product.seo?.metaTitle || '',
                    metaDescription: product.seo?.metaDescription || '',
                },
                isActive: product.isActive ?? true,
                isFeatured: product.isFeatured ?? false,
            });

            if (product.images && product.images.length > 0) {
                setImages(product.images);
            }
        } catch (err) {
            setError('Failed to load product');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageChange = (newImages) => {
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: images.filter(img => img.url),
            };

            await api.put(`/admin/products/${id}`, productData);
            navigate('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <Loader className="animate-spin" size={48} />
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="flex items-center gap-2 text-crown-gold hover:text-crown-gold-light transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Products</span>
                    </button>
                    <h1>Edit Product</h1>
                    <p>Update product information</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Basic Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="admin-form-group">
                                    <label htmlFor="name">Product Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Royal Oak Chronograph"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="admin-form-group">
                                        <label htmlFor="brand">Brand *</label>
                                        <input
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Audemars Piguet"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="model">Model *</label>
                                        <input
                                            type="text"
                                            id="model"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., 26331ST"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="shortDescription">Short Description</label>
                                    <input
                                        type="text"
                                        id="shortDescription"
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        placeholder="Brief product description"
                                        maxLength="500"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="description">Full Description *</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Detailed product description..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Specifications</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.movement">Movement</label>
                                        <select
                                            id="specifications.movement"
                                            name="specifications.movement"
                                            value={formData.specifications.movement}
                                            onChange={handleChange}
                                        >
                                            <option value="automatic">Automatic</option>
                                            <option value="quartz">Quartz</option>
                                            <option value="mechanical">Mechanical</option>
                                            <option value="kinetic">Kinetic</option>
                                            <option value="solar">Solar</option>
                                        </select>
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.caseMaterial">Case Material</label>
                                        <input
                                            type="text"
                                            id="specifications.caseMaterial"
                                            name="specifications.caseMaterial"
                                            value={formData.specifications.caseMaterial}
                                            onChange={handleChange}
                                            placeholder="e.g., Stainless Steel"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.caseDiameter">Case Diameter</label>
                                        <input
                                            type="text"
                                            id="specifications.caseDiameter"
                                            name="specifications.caseDiameter"
                                            value={formData.specifications.caseDiameter}
                                            onChange={handleChange}
                                            placeholder="e.g., 41mm"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.waterResistance">Water Resistance</label>
                                        <input
                                            type="text"
                                            id="specifications.waterResistance"
                                            name="specifications.waterResistance"
                                            value={formData.specifications.waterResistance}
                                            onChange={handleChange}
                                            placeholder="e.g., 50m"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.strapMaterial">Strap Material</label>
                                        <input
                                            type="text"
                                            id="specifications.strapMaterial"
                                            name="specifications.strapMaterial"
                                            value={formData.specifications.strapMaterial}
                                            onChange={handleChange}
                                            placeholder="e.g., Leather"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.glass">Glass</label>
                                        <input
                                            type="text"
                                            id="specifications.glass"
                                            name="specifications.glass"
                                            value={formData.specifications.glass}
                                            onChange={handleChange}
                                            placeholder="e.g., Sapphire Crystal"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.warranty">Warranty</label>
                                        <input
                                            type="text"
                                            id="specifications.warranty"
                                            name="specifications.warranty"
                                            value={formData.specifications.warranty}
                                            onChange={handleChange}
                                            placeholder="e.g., 2 years"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="specifications.powerReserve">Power Reserve</label>
                                        <input
                                            type="text"
                                            id="specifications.powerReserve"
                                            name="specifications.powerReserve"
                                            value={formData.specifications.powerReserve}
                                            onChange={handleChange}
                                            placeholder="e.g., 48 hours"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Product Images</h2>
                            </div>
                            <div className="p-6">
                                <ProductImageUploader
                                    images={images}
                                    onChange={handleImageChange}
                                    maxImages={5}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing & Inventory */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Pricing & Inventory</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="admin-form-group">
                                    <label htmlFor="price">Price *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="currency">Currency</label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="stock">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Category</h2>
                            </div>
                            <div className="p-6">
                                <div className="admin-form-group">
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="luxury">Luxury</option>
                                        <option value="sport">Sport</option>
                                        <option value="casual">Casual</option>
                                        <option value="smart">Smart</option>
                                        <option value="vintage">Vintage</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2>Status</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="rounded border-crown-gold/30"
                                    />
                                    <span className="text-text-dark font-medium">Active</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="rounded border-crown-gold/30"
                                    />
                                    <span className="text-text-dark font-medium">Featured</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-gold flex-1"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
