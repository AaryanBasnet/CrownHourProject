import { useState, useEffect } from 'react';
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
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Refresh CSRF on mount
  useEffect(() => {
    authService.getCsrfToken().catch(err => console.error("Failed to refresh CSRF", err));
  }, []);

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

    if (!executeRecaptcha) {
      addToast("ReCAPTCHA not ready", "error");
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha('register');
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register({ ...registerData, recaptchaToken: captchaToken });

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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`}
        className="w-full flex items-center justify-center gap-2 py-4 px-8 border border-gray-300 bg-white text-crown-black text-xs font-medium tracking-widest uppercase hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all duration-300 shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

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
