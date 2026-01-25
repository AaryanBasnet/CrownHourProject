import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '@store/wishlistStore';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { useToast } from '../context/ToastContext';
import { Loader2, Heart } from 'lucide-react';

export const Wishlist = () => {
    const { items, fetchWishlist, toggleWishlist, isLoading } = useWishlistStore();
    const { addToCart } = useCartStore();
    const { isLoggedIn } = useAuthStore();
    const { addToast } = useToast();
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleMoveToCart = async (product) => {
        const success = await addToCart(product);
        if (success) {
            addToast(`${product.name} added to bag`, 'success');
        }
    };

    const handleRemove = async (product) => {
        setRemovingId(product._id);
        // Delay for animation
        setTimeout(async () => {
            await toggleWishlist(product);
            setRemovingId(null);
        }, 400);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    // Dynamic stock status based on actual product data
    const getStockStatus = (stock) => {
        if (stock === 0) return {
            label: 'Sold Out',
            style: 'text-gray-400 line-through decoration-gray-400',
            dot: 'bg-gray-400'
        };
        if (stock <= 5) return {
            label: `Only ${stock} Left`,
            style: 'text-[#d4a373]', // distinct low stock color
            dot: 'bg-[#d4a373]'
        };
        return {
            label: 'In Stock',
            style: 'text-[#3a5a40]', // success color
            dot: 'bg-[#3a5a40]'
        };
    };

    if (isLoading && items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#C9A962] animate-spin mx-auto mb-4" />
                    <p className="text-[#6B6B6B] tracking-widest text-sm uppercase">Loading Wishlist...</p>
                </div>
            </div>
        );
    }

    // Empty State
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <header className="pt-32 pb-16 px-4 text-center border-b border-black/5 bg-gradient-to-b from-white to-[#FAF8F5]">
                    <span className="block text-xs uppercase tracking-[2px] text-[#C9A962] mb-4">Your Selection</span>
                    <h1 className="font-display text-4xl lg:text-5xl font-normal text-[#1A1A1A] mb-4">Saved Timepieces</h1>
                    <div className="text-[#6B6B6B]">0 Items</div>
                </header>

                <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                    <Heart className="w-16 h-16 text-[#C9A962] opacity-50 mb-8" />
                    <h3 className="font-display text-3xl text-[#1A1A1A] mb-4">Your wishlist is empty</h3>
                    <p className="text-[#6B6B6B] mb-10 max-w-md mx-auto">Browse our collection and find your next timepiece.</p>
                    <Link
                        to="/shop"
                        className="px-12 py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-[2px] hover:bg-[#C9A962] transition-colors"
                    >
                        Explore Collection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Header */}
            <header className="pt-32 pb-16 px-4 text-center border-b border-black/5 bg-gradient-to-b from-white to-[#FAF8F5]">
                <span className="block text-xs uppercase tracking-[2px] text-[#C9A962] mb-4">Your Selection</span>
                <h1 className="font-display text-4xl lg:text-5xl font-normal text-[#1A1A1A] mb-4">Saved Timepieces</h1>
                <div className="text-[#6B6B6B]">{items.length} {items.length === 1 ? 'Item' : 'Items'}</div>
            </header>

            <section className="max-w-[1400px] mx-auto px-4 py-16">
                {/* Login Banner for Guests */}
                {!isLoggedIn && (
                    <div className="max-w-2xl mx-auto mb-16 p-6 border border-[#C9A962] bg-white text-center flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                        <span className="text-[#1A1A1A]">Sync your wishlist across all your devices.</span>
                        <Link to="/login" className="underline font-medium text-[#1A1A1A] hover:text-[#C9A962]">Sign In or Create Account</Link>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {items.map((product) => {
                        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0] || { url: 'https://via.placeholder.com/300' };
                        const stockInfo = getStockStatus(product.stock || 0);
                        const isRemoving = removingId === product._id;

                        // Tailwind classes for animation
                        const cardClasses = `
                            flex flex-col bg-white border border-black/5 relative transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]
                            hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:border-[#C9A962]
                            ${isRemoving ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
                        `;

                        return (
                            <article key={product._id} className={cardClasses}>
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(product)}
                                    className="absolute top-4 right-4 w-[30px] h-[30px] flex items-center justify-center bg-white border border-black/10 text-gray-400 rounded-full hover:bg-[#9e2a2b] hover:border-[#9e2a2b] hover:text-white transition-all z-10"
                                    title="Remove from wishlist"
                                >
                                    ×
                                </button>

                                {/* Image Area */}
                                <div className="bg-[#FAF8F5] h-[300px] p-8 relative overflow-hidden flex items-center justify-center group">
                                    <Link to={`/product/${product.slug}`} className="block w-full h-full">
                                        <img
                                            src={primaryImage.url}
                                            alt={product.name}
                                            className={`w-full h-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 ${product.stock === 0 ? 'grayscale' : ''}`}
                                        />
                                    </Link>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <Link to={`/product/${product.slug}`} className="font-display text-2xl text-[#1A1A1A] mb-2 hover:text-[#C9A962] transition-colors decoration-0">
                                        {product.name}
                                    </Link>

                                    <div className="text-lg font-medium text-[#1A1A1A] mb-4">
                                        {formatPrice(product.price)}
                                    </div>

                                    <div className={`text-xs uppercase tracking-widest mb-6 flex items-center gap-2 ${stockInfo.style}`}>
                                        <div className={`w-2 h-2 rounded-full ${stockInfo.dot}`}></div>
                                        {stockInfo.label}
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            disabled={product.stock === 0}
                                            onClick={() => handleMoveToCart(product)}
                                            className="w-full py-4 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-xs uppercase tracking-[2px] transition-all hover:bg-[#C9A962] hover:border-[#C9A962] disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent disabled:cursor-not-allowed"
                                        >
                                            {product.stock === 0 ? 'Notify Me' : 'Add to Bag'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};


