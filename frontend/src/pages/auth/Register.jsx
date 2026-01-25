import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { registerSchema } from '@utils/schemas';
import { authService } from '@services';
import { useAuthStore } from '@store/authStore';
import AuthLayout from '@components/auth/AuthLayout';
import FormInput from '@components/common/FormInput';
import PasswordStrengthMeter from '@components/auth/PasswordStrengthMeter';
import { useToast } from '../../context/ToastContext';

export const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onRegisterSubmit = async (data) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);

      if (response.requiresOtp) {
        setVerificationEmail(response.email || data.email);
        setShowOtp(true);
        addToast('Verification code sent to your email.', 'success');
      } else {
        // Fallback for non-OTP flow (unlikely with current backend)
        addToast('Registration successful! Please login.', 'success');
        navigate('/login');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !otp) return;

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(verificationEmail, otp);

      // Update auth store with user data
      if (response.data?.user) {
        setAuth(response.data.user);
        addToast('Account verified successfully!', 'success');
        navigate('/');
      } else {
        addToast('Verification successful. Please login.', 'success');
        navigate('/login');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Invalid code.';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="Verify Email"
        subtitle={`Enter the 6-digit code sent to ${verificationEmail}`}
        visualSide="left"
      >
        <div className="space-y-6">
          <button
            onClick={() => setShowOtp(false)}
            className="flex items-center text-sm text-gray-500 hover:text-crown-gold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </button>

          <form onSubmit={onVerifySubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-crown-gold/70" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-gray-200 focus:border-crown-gold/50 focus:ring-1 focus:ring-crown-gold/50 transition-all outline-none tracking-[0.5em] text-center font-mono text-lg"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Check your spam folder if you don't see the email.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg group"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register for exclusive access to our collection."
      visualSide="left"
    >
      <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            name="firstName"
            register={register}
            error={errors.firstName}
            placeholder="John"
            Icon={User}
          />
          <FormInput
            label="Last Name"
            name="lastName"
            register={register}
            error={errors.lastName}
            placeholder="Doe"
            Icon={User}
          />
        </div>

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          register={register}
          error={errors.email}
          placeholder="you@example.com"
          Icon={Mail}
        />

        <div>
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="••••••••"
            Icon={Lock}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register}
          error={errors.confirmPassword}
          placeholder="••••••••"
          Icon={Lock}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg group"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-gray-500 font-light">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
