import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '@components/auth/AuthLayout';
import { Mail, ArrowRight } from 'lucide-react';

export const CheckEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'your email';

    return (
        <AuthLayout
            title="Check Your Email"
            subtitle={`We've sent a verification link to ${email}`}
            visualSide="left"
        >
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-amber-600" />
                </div>

                <p className="text-gray-500 font-light max-w-sm">
                    Please click the link in the email to verify your account. If you don't see it, check your spam folder.
                </p>

                <div className="space-y-4 w-full pt-4">
                    {/* Dev Only: Auto-click link */}
                    {location.state?.devOnlyVerifyUrl && (
                        <a
                            href={location.state.devOnlyVerifyUrl}
                            className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-amber-100 text-amber-800 text-xs font-medium tracking-widest uppercase hover:bg-amber-200 transition-all duration-300 shadow-sm mb-4"
                        >
                            [DEV] Verify Email Now
                        </a>
                    )}

                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 py-4 px-8 border border-gray-200 text-crown-black text-xs font-medium tracking-widest uppercase hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300 shadow-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};
