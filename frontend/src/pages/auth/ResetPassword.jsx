import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@services';
import { resetPasswordSchema } from '@utils/schemas';
import AuthLayout from '@components/auth/AuthLayout';
import FormInput from '@components/common/FormInput';
import { useToast } from '../../context/ToastContext';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data) => {
        if (isLoading) return;
        if (!token) {
            addToast('Invalid reset link.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token, data.password);
            setIsSuccess(true);
            addToast('Password reset successfully!', 'success');

            // Optional: Auto redirect after few seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const message = err.response?.data?.message || 'Password reset failed. Please try again.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Create a new, strong password for your account."
            visualSide="right"
        >
            {isSuccess ? (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Password Reset Complete</h3>
                    <p className="text-gray-600 text-sm">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/login"
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-8 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 transition-all rounded"
                        >
                            Go to Sign In
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormInput
                            label="New Password"
                            name="password"
                            type="password"
                            register={register}
                            error={errors.password}
                            placeholder="••••••••"
                            Icon={Lock}
                        />

                        <FormInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            register={register}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            Icon={Lock}
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
                                Reset Password
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ResetPassword;
