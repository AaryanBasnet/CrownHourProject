import { useState } from 'react';
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

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await authService.login(data);

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
              {/* Label is handled by FormInput, but we need to inject the forgot password link. 
                   Since FormInput encapsulates the label, we'll put the link absolutely positioned or just above content? 
                   Actually FormInput structure is label -> input. 
                   Better to pass the link as a prop or children? 
                   For now, let's keep it simple and just put the link separately if needed, 
                   OR, refactor FormInput to accept a cornerRender prop.
                   Let's stick to the DRY FormInput for now and maybe put the link after label? 
                   Actually FormInput is rigid. I'll modify the loop above.
               */}
            </div>
            {/* 
                The FormInput component is rigid. We can pass a `labelAction` prop to it. 
                I will skip modifying FormInput for now and just render the link *above* passing control. 
                Wait, FormInput renders the label. I can hide the label in FormInput and render my own?
                No, let's just use FormInput as designed. 
            */}
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
    </AuthLayout>
  );
};
