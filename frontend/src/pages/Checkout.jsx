import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { paymentService } from '@services';
import { useCartStore } from '@store/cartStore';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { useAuthStore } from '@store/authStore';
import { useToast } from '../context/ToastContext';
import { Loader2, ArrowRight, Check } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const Checkout = () => {
    const [step, setStep] = useState('ADDRESS'); // 'ADDRESS' | 'PAYMENT'
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { items, subtotal: total } = useCartStore();
    const { user } = useAuthStore();
    const { addToast } = useToast();

    // Shipping Address Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US', // Default
        },
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: {
                    line1: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    postal_code: user.address?.postalCode || '',
                    country: user.address?.country || 'US',
                },
            });
        }
    }, [user]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address.line1 || !formData.address.city || !formData.address.postal_code) {
            addToast('Please fill in all required fields', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Construct the shipping address object expected by backend/Stripe
            const shippingAddress = {
                name: `${formData.firstName} ${formData.lastName}`,
                address: formData.address,
                phone: formData.phone
            };

            const data = await paymentService.createPaymentIntent(items, shippingAddress);
            setClientSecret(data.clientSecret);
            setStep('PAYMENT');
        } catch (error) {
            console.error("Error creating payment intent:", error);
            addToast("Failed to initialize payment. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#C9A962',
            colorBackground: '#ffffff',
            colorText: '#1A1A1A',
            colorDanger: '#9e2a2b',
            fontFamily: '"Outfit", system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '0px',
        },
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] pt-32 text-center px-4">
                <h1 className="font-display text-4xl mb-4 text-[#1A1A1A]">Your Bag is Empty</h1>
                <a href="/shop" className="text-crown-gold border-b border-crown-gold pb-1 hover:text-crown-gold-dark">Continue Shopping</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="font-display text-4xl lg:text-5xl mb-12 text-center text-[#1A1A1A]">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Forms */}
                    <div className="space-y-8">

                        {/* Address Step */}
                        <div className={`bg-white p-8 border ${step === 'ADDRESS' ? 'border-crown-gold shadow-md' : 'border-black/5 opacity-60'}`}>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/5">
                                <h2 className="font-display text-2xl text-[#1A1A1A]">1. Shipping Address</h2>
                                {step === 'PAYMENT' && (
                                    <button onClick={() => setStep('ADDRESS')} className="text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#C9A962]">Edit</button>
                                )}
                            </div>

                            {step === 'ADDRESS' ? (
                                <form onSubmit={handleAddressSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">First Name *</label>
                                            <input
                                                required
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleAddressChange}
                                                className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Last Name *</label>
                                            <input
                                                required
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleAddressChange}
                                                className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Phone *</label>
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleAddressChange}
                                            className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Street Address *</label>
                                        <input
                                            required
                                            type="text"
                                            name="address.line1"
                                            value={formData.address.line1}
                                            onChange={handleAddressChange}
                                            placeholder="123 Luxury Lane"
                                            className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">City *</label>
                                            <input
                                                required
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleAddressChange}
                                                className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">State *</label>
                                            <input
                                                required
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleAddressChange}
                                                className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Postal Code *</label>
                                            <input
                                                required
                                                type="text"
                                                name="address.postal_code"
                                                value={formData.address.postal_code}
                                                onChange={handleAddressChange}
                                                className="w-full p-3 border border-black/10 focus:border-[#C9A962] outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Country</label>
                                            <input
                                                readOnly
                                                type="text"
                                                name="address.country"
                                                value="United States"
                                                className="w-full p-3 border border-black/10 bg-[#FAF8F5] text-[#6B6B6B] cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#1A1A1A] text-white py-4 px-8 uppercase tracking-[2px] hover:bg-[#C9A962] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Continue to Payment <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            ) : (
                                // Address Summary State
                                <div className="text-sm text-[#6B6B6B]">
                                    <p className="font-medium text-[#1A1A1A] mb-1">{formData.firstName} {formData.lastName}</p>
                                    <p>{formData.address.line1}</p>
                                    <p>{formData.address.city}, {formData.address.state} {formData.address.postal_code}</p>
                                    <p className="mt-1">{formData.phone}</p>

                                    <div className="flex items-center gap-2 text-green-600 mt-4 text-xs font-medium uppercase tracking-widest">
                                        <Check size={14} /> Address Confirmed
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Step */}
                        <div className={`bg-white p-8 border ${step === 'PAYMENT' ? 'border-crown-gold shadow-md' : 'border-black/5 opacity-60'}`}>
                            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-black/5 text-[#1A1A1A]">2. Secure Payment</h2>

                            {step === 'PAYMENT' ? (
                                clientSecret ? (
                                    <Elements options={{ appearance, clientSecret }} stripe={stripePromise}>
                                        <CheckoutForm clientSecret={clientSecret} />
                                    </Elements>
                                ) : (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-[#C9A962]" size={32} />
                                    </div>
                                )
                            ) : (
                                <p className="text-[#6B6B6B] text-sm">Please provide shipping details first.</p>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:sticky lg:top-32 bg-white p-8 border border-black/5 h-fit">
                        <h2 className="font-display text-2xl mb-6 pb-4 border-b border-black/5 text-[#1A1A1A]">Order Summary</h2>
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.product._id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-4">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-black/5" />
                                        )}
                                        <div>
                                            <p className="font-medium text-[#1A1A1A]">{item.name}</p>
                                            <p className="text-[#6B6B6B] text-xs">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 text-sm text-[#6B6B6B] border-t border-black/5 pt-4 mb-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%)</span>
                                <span>${(total * 0.1).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{total > 100 ? 'Free' : '$10.00'}</span>
                            </div>
                        </div>

                        <div className="border-t border-black/5 pt-4 flex justify-between items-center font-display text-xl text-[#1A1A1A]">
                            <span>Total</span>
                            <span>${(total * 1.1 + (total > 100 ? 0 : 10)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
