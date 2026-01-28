import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginSchema } from '@utils/schemas';
import { authService } from '@services';
import { useAuthStore } from '@store/authStore';
import AuthLayout from '@components/auth/AuthLayout';
import FormInput from '@components/common/FormInput';
import { useToast } from '../../context/ToastContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { addToast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Check if user was logged out due to idle timeout & Refresh CSRF
  useEffect(() => {
    const initLogin = async () => {
      // MAX SECURITY: Always get a fresh CSRF token when landing on login page
      // This fixes the bug where users can't login after idle timeout without a hard refresh
      try {
        await authService.getCsrfToken();
      } catch (err) {
        console.error("Failed to refresh CSRF", err);
      }
    };

    initLogin();

    const params = new URLSearchParams(location.search);
    const reason = params.get('reason');

    if (reason === 'idle_timeout') {
      addToast(
        'You were logged out due to 2 minutes of inactivity. Please login again.',
        'warning',
        7000
      );
      // Clean up URL but stay on page
      navigate('/login', { replace: true });
    } else if (reason === 'session_expired') {
      addToast(
        'Your session has expired. Please login again.',
        'warning',
        7000
      );
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, addToast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;

    if (!executeRecaptcha) {
      addToast("ReCAPTCHA not ready", "error");
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha('login');
      const response = await authService.login({ ...data, recaptchaToken: captchaToken });

      if (response.mfaRequired) {
        navigate('/mfa-verify', {
          state: {
            email: data.email,
            password: data.password
          }
        });
        return;
      }

      if (response.data?.user) {
        setAuth(response.data.user);

        if (response.data.user.passwordExpired) {
          addToast('Security Alert: Your password has expired. Please update it immediately.', 'warning');
          navigate('/profile'); // Redirect to profile to change password
          return;
        }

        addToast('Welcome back!', 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your curated collection."
      visualSide="right"
    >
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

          <div>
            <div className="flex items-center justify-between mb-2">
             
            </div>
           
            <div className="relative">
              <FormInput
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                placeholder="••••••••"
                Icon={Lock}
              />
              <Link
                to="/forgot-password"
                className="absolute top-0 right-0 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
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
              Sign In
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

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
      </form>

      <div className="text-center pt-4">
        <p className="text-gray-500 font-light">
          Not a member yet?{' '}
          <Link
            to="/register"
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout >
  );
};
