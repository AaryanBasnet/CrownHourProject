import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mfaSchema } from '@utils/schemas';
import { authService } from '@services';
import { useAuthStore } from '@store/authStore';

/**
 * MFA Verification Page
 * Handles TOTP (Google Authenticator) verification
 * User arrives here after login if MFA is enabled
 */
export const MFAVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Email and password should be passed from Login page
  const email = location.state?.email;
  const password = location.state?.password;

  // Redirect if no credentials
  if (!email || !password) {
    navigate('/login');
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mfaSchema),
  });

  const onSubmit = async (data) => {
    // Prevent duplicate submissions
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Re-submit login with MFA token
      const response = await authService.login({
        email,
        password,
        mfaToken: data.mfaToken,
      });

      // MFA verification successful
      if (response.data?.user) {
        setAuth(response.data.user);
        navigate('/shop', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid verification code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full p-8 bg-white shadow-xl border border-stone-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-stone-50 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-crown-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-crown-black">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-stone-500">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* MFA Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Code Input */}
          <div>
            <label htmlFor="mfaToken" className="block text-sm font-medium text-stone-700 mb-2">
              Verification Code
            </label>
            <input
              {...register('mfaToken')}
              id="mfaToken"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-white border border-stone-200 focus:border-crown-gold focus:ring-1 focus:ring-crown-gold outline-none transition-all font-mono text-crown-black placeholder-stone-300"
              placeholder="000000"
              autoFocus
            />
            {errors.mfaToken && (
              <p className="mt-2 text-sm text-red-500">{errors.mfaToken.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-crown-black text-white py-4 px-8 text-xs font-medium tracking-widest uppercase hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full bg-white text-stone-600 border border-stone-200 py-4 px-8 text-xs font-medium tracking-widest uppercase hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            Back to Login
          </button>
        </form>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-stone-400">
          Can't access your authenticator?{' '}
          <a href="#" className="text-stone-600 font-medium hover:text-crown-gold transition-colors">
            Contact Support
          </a>
        </p>
      </motion.div>
    </div>
  );
};
