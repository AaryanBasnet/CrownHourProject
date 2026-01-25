import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';

/**
 * ProductCard Component - Light Theme
 * Displays individual product with hover effects and actions
 * 
 * Security:
 * - All product data sanitized by backend
 * - React automatically escapes all content (XSS protection)
 * - No dangerouslySetInnerHTML usage
 */
export const ProductCard = ({ product, onAddToCart }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { isInWishlist, toggleWishlist } = useWishlistStore();

    const inWishlist = isInWishlist(product._id);

    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x400?text=No+Image';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.currency || 'USD',
        }).format(price);
    };

    const getBadgeText = () => {
        if (product.isFeatured) return { text: 'Best Seller', color: 'bg-[#1A1A1A]' };
        if (product.stock === 0) return { text: 'Sold Out', color: 'bg-red-500' };
        if (product.stock < 5) return { text: 'Limited', color: 'bg-[#C9A962]' };
        return null;
    };

    const badge = getBadgeText();

    const handleWishlistToggle = async () => {
        await toggleWishlist(product);
    };

    return (
        <div className="relative group bg-white border border-black/5 hover:border-[#C9A962]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A962]/10 hover:-translate-y-2">
            {/* Badge */}
            {badge && (
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold tracking-widest uppercase ${badge.color} text-white`}>
                    {badge.text}
                </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <button
                    onClick={handleWishlistToggle}
                    className={`w-9 h-9 bg-white hover:bg-[#C9A962] border border-black/10 flex items-center justify-center transition-colors shadow-sm ${inWishlist ? 'bg-red-50' : ''
                        }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        size={16}
                        className={inWishlist ? 'text-red-500' : 'text-[#1A1A1A]'}
                        fill={inWishlist ? 'currentColor' : 'none'}
                    />
                </button>
                <Link
                    to={`/product/${product.slug || product._id}`}
                    className="w-9 h-9 bg-white hover:bg-[#C9A962] border border-black/10 flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Quick view"
                >
                    <Eye size={16} className="text-[#1A1A1A]" />
                </Link>
            </div>

            {/* Image */}
            <Link to={`/product/${product.slug || product._id}`} className="block relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-white p-8">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className={`w-full h-72 object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin" />
                    </div>
                )}
            </Link>

            {/* Details */}
            <div className="p-6">
                <div className="text-xs text-[#C9A962] uppercase tracking-[0.2em] mb-2">
                    {product.category}
                </div>

                <Link to={`/product/${product.slug || product._id}`}>
                    <h3 className="font-display text-2xl text-[#1A1A1A] mb-2 hover:text-[#C9A962] transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-xl text-[#1A1A1A]">
                        {formatPrice(product.price)}
                    </span>
                    {product.rating?.average > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                            <span className="text-[#C9A962]">★</span>
                            {product.rating.average.toFixed(1)}
                            <span>({product.rating.count})</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]"
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        currency: PropTypes.string,
        category: PropTypes.string.isRequired,
        stock: PropTypes.number.isRequired,
        isFeatured: PropTypes.bool,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                url: PropTypes.string.isRequired,
                isPrimary: PropTypes.bool,
            })
        ),
        rating: PropTypes.shape({
            average: PropTypes.number,
            count: PropTypes.number,
        }),
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
};
