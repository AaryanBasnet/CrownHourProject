import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@store/cartStore';
import { Minus, Plus, X, Trash2, ArrowRight } from 'lucide-react';

export const Cart = () => {
    const { items, subtotal, removeFromCart, updateQuantity, fetchCart, isLoading } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (items.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
                <h1 className="font-display text-4xl mb-6">Your Bag is Empty</h1>
                <p className="text-[#6B6B6B] mb-8">It seems you haven't found the perfect timepiece yet.</p>
                <Link
                    to="/shop"
                    className="px-8 py-3 bg-[#1A1A1A] text-white uppercase tracking-widest hover:bg-[#C9A962] transition-colors"
                >
                    Discover Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-4">
                <h1 className="font-display text-4xl lg:text-5xl mb-12 text-center text-[#1A1A1A]">Shopping Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">

                    {/* Cart Items */}
                    <div className="space-y-8">
                        {items.map((item, index) => (
                            <div key={item._id || index} className="bg-white p-6 border border-black/5 flex gap-6 items-center">
                                {/* Image */}
                                <Link to={`/product/${item.product?.slug || ''}`} className="w-24 h-24 lg:w-32 lg:h-32 shrink-0 bg-[#F9F9F9] flex items-center justify-center">
                                    <img
                                        src={item.product?.images?.[0]?.url || item.image}
                                        alt={item.product?.name}
                                        className="max-w-[80%] max-h-[80%] object-contain mix-blend-multiply"
                                    />
                                </Link>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <Link to={`/product/${item.product?.slug || ''}`} className="font-display text-xl text-[#1A1A1A] hover:text-[#C9A962] transition-colors">
                                            {item.product?.name}
                                        </Link>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-[#6B6B6B] hover:text-red-500 transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <p className="text-sm text-[#6B6B6B] mb-4">
                                        {item.color?.name && <span className="mr-3">Color: {item.color.name}</span>}
                                        {item.strap?.material && <span>Strap: {item.strap.material}</span>}
                                    </p>

                                    <div className="flex justify-between items-end">
                                        {/* Quantity Control */}
                                        <div className="flex items-center border border-black/10">
                                            <button
                                                onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="font-display text-xl text-[#1A1A1A]">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-xs text-[#6B6B6B] mt-1">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="h-fit sticky top-32">
                        <div className="bg-white p-8 border border-black/5">
                            <h2 className="font-display text-2xl mb-6">Order Summary</h2>

                            <div className="flex justify-between mb-4 text-[#6B6B6B]">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <div className="flex justify-between mb-8 text-[#6B6B6B]">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>

                            <div className="flex justify-between mb-8 pt-4 border-t border-black/5">
                                <span className="font-medium text-[#1A1A1A]">Total</span>
                                <span className="font-display text-3xl text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-4 bg-[#1A1A1A] text-white uppercase tracking-widest hover:bg-[#C9A962] transition-colors flex items-center justify-center gap-2 group"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-6 text-xs text-[#6B6B6B] text-center">
                                <p>Secure Checkout - encrypted connection</p>
                                <p className="mt-2">Free shipping & returns worldwide</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
