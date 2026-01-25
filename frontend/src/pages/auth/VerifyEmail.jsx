import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import AuthLayout from '@components/auth/AuthLayout';
import { authService } from '@services';
import { useToast } from '../../context/ToastContext';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus('success');
                setMessage('Your email has been successfully verified.');
                addToast('Email verified successfully!', 'success');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Link may be expired.');
                addToast(err.response?.data?.message || 'Verification failed.', 'error');
            }
        };

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <AuthLayout
            title={status === 'success' ? 'Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying...'}
            subtitle={status === 'success' ? 'You can now sign in.' : ''}
            visualSide="left"
        >
            <div className="flex flex-col items-center justify-center space-y-8 text-center py-8">
                {status === 'verifying' && (
                    <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
                )}

                {status === 'success' && (
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                )}

                {status === 'error' && (
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                )}

                <p className={`text-lg ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                    {message}
                </p>

                {status !== 'verifying' && (
                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300 shadow-lg group"
                    >
                        Sign In Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}

                {status === 'error' && (
                    <p className="text-sm text-gray-500">
                        If the link is expired, please try registering again or contact support.
                    </p>
                )}
            </div>
        </AuthLayout>
    );
};
