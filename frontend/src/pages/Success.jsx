import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const Success = () => {
    return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                <CheckCircle className="w-20 h-20 text-[#3a5a40] mx-auto mb-6" />
                <h1 className="font-display text-4xl lg:text-5xl mb-6 text-[#1A1A1A]">Order Confirmed</h1>
                <p className="text-[#6B6B6B] mb-8 text-lg">
                    Thank you for your purchase. Your order has been securely processed. You will receive a confirmation email shortly.
                </p>
                <Link
                    to="/shop"
                    className="inline-block px-8 py-3 bg-[#1A1A1A] text-white uppercase tracking-[2px] text-sm hover:bg-[#C9A962] transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};
