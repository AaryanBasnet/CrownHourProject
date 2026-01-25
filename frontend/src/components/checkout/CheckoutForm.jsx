import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useCartStore } from '@store/cartStore';
import { useToast } from '../../context/ToastContext';
import { Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@services';

export const CheckoutForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const { clearCart } = useCartStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Change this to your payment completion page
                return_url: `${window.location.origin}/success`,
            },
            redirect: "if_required"
        });

        if (error) {
            setMessage(error.message);
            addToast(error.message, 'error');
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                // Create Order in Database
                const { items, subtotal: total } = useCartStore.getState();
                // Mock address if not passed - in real app, pass this as prop
                const shippingAddress = {
                    firstName: 'Test',
                    lastName: 'User',
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'US',
                    phone: '1234567890'
                };

                await orderService.createOrder({
                    items: items.map(i => ({
                        product: i.product._id,
                        quantity: i.quantity,
                        priceAtPurchase: i.price
                    })),
                    shippingAddress,
                    billingAddress: shippingAddress,
                    payment: {
                        method: 'credit_card',
                        status: 'completed',
                        transactionId: paymentIntent.id,
                        paidAt: new Date()
                    },
                    totalPrice: total
                });

                addToast('Payment successful!', 'success');
                clearCart();
                navigate('/success');
            } catch (err) {
                console.error('Order creation failed:', err);
                // Payment succeeded but order creation failed
                // In a real app, you would handle this gracefully (e.g. trigger backend check)
                addToast('Payment succeeded but order creation failed. Please contact support.', 'warning');
                navigate('/success'); // Still navigate out
            }

            setIsLoading(false);
        } else {
            setMessage('An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" />

            {message && <div className="text-red-500 text-sm">{message}</div>}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-[#1A1A1A] text-white uppercase tracking-widest hover:bg-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={16} />
                        Pay Now
                    </>
                )}
            </button>
        </form>
    );
};
