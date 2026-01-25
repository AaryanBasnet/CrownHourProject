import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from '@store/authStore';
import { ToastProvider } from './context/ToastContext';

// Key Components (non-lazy for immediate render structure)
import { ErrorBoundary, RequireAuth, RequireRole, PublicOnly } from '@components';
import NavbarWrapper from '@components/layout/NavbarWrapper';
import Footer from '@components/layout/Footer';
import AdminLayout from '@components/admin/AdminLayout';

// Lazy Components with Named Exports handling
const loadPage = (importPromise, name) => importPromise.then(module => ({ default: module[name] }));

const Home = lazy(() => loadPage(import('@pages/Home'), 'Home'));
const Shop = lazy(() => loadPage(import('@pages/Shop'), 'Shop'));
const Men = lazy(() => loadPage(import('@pages/Men'), 'Men'));
const Women = lazy(() => loadPage(import('@pages/Women'), 'Women'));
const About = lazy(() => loadPage(import('@pages/About'), 'About'));
const ProductDetail = lazy(() => loadPage(import('@pages/ProductDetail'), 'ProductDetail'));
const Wishlist = lazy(() => loadPage(import('@pages/Wishlist'), 'Wishlist'));
const Cart = lazy(() => loadPage(import('@pages/Cart'), 'Cart'));
const Checkout = lazy(() => loadPage(import('@pages/Checkout'), 'Checkout'));
const Success = lazy(() => loadPage(import('@pages/Success'), 'Success'));
const Profile = lazy(() => import('@pages/Profile').then(m => ({ default: m.default })));

// Auth Pages (Lazy)
const Login = lazy(() => loadPage(import('@pages/auth/Login'), 'Login'));
const Register = lazy(() => loadPage(import('@pages/auth/Register'), 'Register'));
const MFAVerify = lazy(() => import('@pages/auth/MFAVerify').then(m => ({ default: m.MFAVerify })));
const CheckEmail = lazy(() => import('@pages/auth/CheckEmail').then(m => ({ default: m.CheckEmail })));
const VerifyEmail = lazy(() => import('@pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })));

// Admin (Lazy)
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement').then(m => ({ default: m.default })));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement').then(m => ({ default: m.default })));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement').then(m => ({ default: m.default })));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement').then(m => ({ default: m.default })));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(m => ({ default: m.default })));
const Unauthorized = lazy(() => import('@pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

/**
 * React Query Client Configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Loading Spinner Component
 */
const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-crown-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-crown-gold/30 border-t-crown-gold rounded-full animate-spin mx-auto mb-4" />
      <p className="text-crown-gray tracking-widest text-xs uppercase">Loading CrownHour...</p>
    </div>
  </div>
);

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<FullScreenLoader />}>
              <Routes>
                {/* Public Routes - WITH Navbar */}
                <Route path="/" element={<><NavbarWrapper /><Home /><Footer /></>} />
                <Route path="/shop" element={<><NavbarWrapper /><Shop /><Footer /></>} />
                <Route path="/men" element={<><NavbarWrapper /><Men /><Footer /></>} />
                <Route path="/women" element={<><NavbarWrapper /><Women /><Footer /></>} />
                <Route path="/about" element={<><NavbarWrapper /><About /><Footer /></>} />
                <Route path="/product/:slug" element={<><NavbarWrapper /><ProductDetail /><Footer /></>} />
                <Route path="/wishlist" element={<><NavbarWrapper /><Wishlist /><Footer /></>} />
                <Route path="/cart" element={<><NavbarWrapper /><Cart /><Footer /></>} />
                <Route path="/checkout" element={<><NavbarWrapper /><RequireAuth><Checkout /></RequireAuth><Footer /></>} />
                <Route path="/success" element={<><NavbarWrapper /><Success /><Footer /></>} />
                <Route path="/unauthorized" element={<><NavbarWrapper /><Unauthorized /><Footer /></>} />

                {/* Auth Routes - WITH Navbar */}
                <Route path="/login" element={<><NavbarWrapper /><PublicOnly><Login /></PublicOnly><Footer /></>} />
                <Route path="/register" element={<><NavbarWrapper /><PublicOnly><Register /></PublicOnly><Footer /></>} />
                <Route path="/mfa-verify" element={<><NavbarWrapper /><PublicOnly><MFAVerify /></PublicOnly><Footer /></>} />
                <Route path="/check-email" element={<><NavbarWrapper /><PublicOnly><CheckEmail /></PublicOnly><Footer /></>} />
                <Route path="/verify-email" element={<><NavbarWrapper /><PublicOnly><VerifyEmail /></PublicOnly><Footer /></>} />

                {/* User Profile - Protected */}
                <Route path="/profile" element={<><NavbarWrapper /><RequireAuth><Profile /></RequireAuth><Footer /></>} />

                {/* Protected Admin Routes - NO Navbar, uses AdminLayout */}
                <Route
                  path="/admin/*"
                  element={
                    <RequireAuth>
                      <RequireRole allowedRoles={['admin']}>
                        <AdminLayout />
                      </RequireRole>
                    </RequireAuth>
                  }
                />


                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ToastProvider >
    </QueryClientProvider >
  );
}

export default App;
