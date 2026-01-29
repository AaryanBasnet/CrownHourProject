import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Heart } from 'lucide-react';
import { sanitizeHTML } from '../../utils/sanitize';
import { useWishlistStore } from '../../store/wishlistStore';

/**
 * ProductInfo Component
 * Product details, variants, and actions
 */
export const ProductInfo = ({
    product,
    selectedColor,
    selectedStrap,
    onColorChange,
    onStrapChange,
    onAddToCart,
    onAddToWishlist,
}) => {
    const { isInWishlist } = useWishlistStore();
    const inWishlist = isInWishlist(product._id);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.currency || 'USD',
        }).format(price);
    };

    const totalPrice = product.price + (selectedStrap?.priceModifier || 0);

    return (
        <div className="pt-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#6B6B6B] mb-6">
                <Link to="/shop" className="hover:text-[#C9A962] transition-colors">Watches</Link>
                <span>/</span>
                <Link to={`/shop?category=${product.category}`} className="hover:text-[#C9A962] transition-colors capitalize">
                    {product.category}
                </Link>
                <span>/</span>
                <span className="text-[#C9A962]">{product.name}</span>
            </nav>

            {/* Badge */}
            {product.isFeatured && (
                <span className="inline-block bg-[#1A1A1A] text-white px-4 py-1.5 text-xs uppercase tracking-[0.2em] mb-4">
                    Best Seller
                </span>
            )}

            {/* Title */}
            <h1 className="font-display text-4xl lg:text-5xl text-[#1A1A1A] leading-tight mb-4">
                {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-2xl lg:text-3xl text-[#1A1A1A]">
                    {formatPrice(totalPrice)}
                </span>
                <span className="text-sm text-[#6B6B6B]">
                    Tax included. Free shipping worldwide.
                </span>
            </div>

            {/* Description */}
            <div
                className="text-[#6B6B6B] text-lg leading-relaxed mb-8 pb-8 border-b border-black/5"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }}
            />

            {/* Color Options */}
            {product.variants?.colors?.length > 0 && (
                <div className="mb-6">
                    <span className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A] font-medium mb-3">
                        Dial Color: <strong className="font-normal">{selectedColor?.name}</strong>
                    </span>
                    <div className="flex gap-3">
                        {product.variants.colors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => onColorChange(color)}
                                disabled={!color.inStock}
                                className={`w-8 h-8 rounded-full relative transition-all ${!color.inStock ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            >
                                {selectedColor?.name === color.name && (
                                    <span className="absolute -inset-1.5 border border-[#1A1A1A] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Strap Material */}
            {product.variants?.straps?.length > 0 && (
                <div className="mb-8">
                    <span className="block text-xs uppercase tracking-[0.15em] text-[#1A1A1A] font-medium mb-3">
                        Strap Material
                    </span>
                    <div className="flex gap-3">
                        {product.variants.straps.map((strap) => (
                            <button
                                key={strap.material}
                                onClick={() => onStrapChange(strap)}
                                disabled={!strap.inStock}
                                className={`px-5 py-2.5 border text-sm transition-all ${selectedStrap?.material === strap.material
                                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                                    : 'border-black/10 text-[#6B6B6B] hover:border-[#C9A962]'
                                    } ${!strap.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {strap.material}
                                {strap.priceModifier > 0 && (
                                    <span className="ml-1 text-[#6B6B6B]">
                                        (+{formatPrice(strap.priceModifier)})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={onAddToCart}
                    disabled={product.stock === 0 || (selectedColor && !selectedColor.inStock) || (selectedStrap && !selectedStrap.inStock)}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#C9A962] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1A]"
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <button
                    onClick={onAddToWishlist}
                    className={`w-14 border flex items-center justify-center transition-all ${inWishlist
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-black/10 hover:border-[#C9A962] hover:text-[#C9A962]'
                        }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        size={20}
                        fill={inWishlist ? 'currentColor' : 'none'}
                    />
                </button>
            </div>
        </div>
    );
};

ProductInfo.propTypes = {
    product: PropTypes.object.isRequired,
    selectedColor: PropTypes.object,
    selectedStrap: PropTypes.object,
    onColorChange: PropTypes.func.isRequired,
    onStrapChange: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onAddToWishlist: PropTypes.func.isRequired,
};
