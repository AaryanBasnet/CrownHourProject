import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { authService } from '@services';
import AuthLayout from '@components/auth/AuthLayout';
import FormInput from '@components/common/FormInput';
import { useToast } from '../../context/ToastContext';

// Simple schema for just email
const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            await authService.forgotPassword(data.email);
            setIsSent(true);
            addToast('Reset link sent!', 'success');
        } catch (err) {
            // Even if failed, we might not want to show it for security, 
            // but in this UI helping the user is better for UX if it's a 500.
            // The backend returns 200 even if user not found (in prod).
            const message = err.response?.data?.message || 'Request failed. Please try again.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Enter your email to reset your password."
            visualSide="left"
        >
            {isSent ? (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Check your email</h3>
                    <p className="text-gray-600 text-sm">
                        We have sent a password reset link to your email address.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            register={register}
                            error={errors.email}
                            placeholder="you@example.com"
                            Icon={Mail}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg group"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Send Reset Link
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4">
                        <Link
                            to="/login"
                            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;
