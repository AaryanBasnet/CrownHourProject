import { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@store/authStore";
import { ToastProvider } from "./context/ToastContext";
import {
  ErrorBoundary,
  RequireAuth,
  RequireRole,
  PublicOnly,
  CustomerOnly,
} from "@components";
import NavbarWrapper from "@components/layout/NavbarWrapper";
import Footer from "@components/layout/Footer";
import AdminLayout from "@components/admin/AdminLayout";
import IdleTimeoutWrapper from "@components/common/IdleTimeoutWrapper";
import { authService } from "@services";
import apiClient from "./api/axios";

// Lazy Components with Named Exports handling
const loadPage = (importPromise, name) =>
  importPromise.then((module) => ({ default: module[name] }));

const Home = lazy(() => loadPage(import("@pages/Home"), "Home"));
const Shop = lazy(() => loadPage(import("@pages/Shop"), "Shop"));
const Men = lazy(() => loadPage(import("@pages/Men"), "Men"));
const Women = lazy(() => loadPage(import("@pages/Women"), "Women"));
const About = lazy(() => loadPage(import("@pages/About"), "About"));
const ProductDetail = lazy(() =>
  loadPage(import("@pages/ProductDetail"), "ProductDetail"),
);
const Wishlist = lazy(() => loadPage(import("@pages/Wishlist"), "Wishlist"));
const Cart = lazy(() => loadPage(import("@pages/Cart"), "Cart"));
const Checkout = lazy(() => loadPage(import("@pages/Checkout"), "Checkout"));
const Success = lazy(() => loadPage(import("@pages/Success"), "Success"));
const Profile = lazy(() =>
  import("@pages/Profile").then((m) => ({ default: m.default })),
);

// Auth Pages (Lazy)
const Login = lazy(() => loadPage(import("@pages/auth/Login"), "Login"));
const Register = lazy(() =>
  loadPage(import("@pages/auth/Register"), "Register"),
);
const MFAVerify = lazy(() =>
  import("@pages/auth/MFAVerify").then((m) => ({ default: m.MFAVerify })),
);
const CheckEmail = lazy(() =>
  import("@pages/auth/CheckEmail").then((m) => ({ default: m.CheckEmail })),
);
const VerifyEmail = lazy(() =>
  import("@pages/auth/VerifyEmail").then((m) => ({ default: m.VerifyEmail })),
);
const OAuthCallback = lazy(() => import("@pages/auth/OAuthCallback"));
const ForgotPassword = lazy(() => import("@pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@pages/auth/ResetPassword"));

// Admin (Lazy)
const AdminDashboard = lazy(() =>
  import("@pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const UsersManagement = lazy(() =>
  import("./pages/admin/UsersManagement").then((m) => ({ default: m.default })),
);
const OrdersManagement = lazy(() =>
  import("./pages/admin/OrdersManagement").then((m) => ({
    default: m.default,
  })),
);
const ProductsManagement = lazy(() =>
  import("./pages/admin/ProductsManagement").then((m) => ({
    default: m.default,
  })),
);
const ReviewsManagement = lazy(() =>
  import("./pages/admin/ReviewsManagement").then((m) => ({
    default: m.default,
  })),
);
const AuditLogs = lazy(() =>
  import("./pages/admin/AuditLogs").then((m) => ({ default: m.default })),
);
const Unauthorized = lazy(() =>
  import("@pages/Unauthorized").then((m) => ({ default: m.Unauthorized })),
);

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
      <p className="text-crown-gray tracking-widest text-xs uppercase">
        Loading CrownHour...
      </p>
    </div>
  </div>
);

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        await authService.getCsrfToken();
      } catch (err) {
        console.error("Failed to init CSRF token", err);
      }
      checkAuth();
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorBoundary>
          <Router
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <IdleTimeoutWrapper>
              <Suspense fallback={<FullScreenLoader />}>
                <Routes>
                  {/* Public Routes - WITH Navbar */}
                  <Route
                    path="/"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Home />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Shop />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/men"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Men />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/women"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Women />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <>
                        <NavbarWrapper />
                        <About />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/product/:slug"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <ProductDetail />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Wishlist />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Cart />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <>
                        <NavbarWrapper />
                        <RequireAuth>
                          <CustomerOnly>
                            <Checkout />
                          </CustomerOnly>
                        </RequireAuth>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/success"
                    element={
                      <>
                        <NavbarWrapper />
                        <CustomerOnly>
                          <Success />
                        </CustomerOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/unauthorized"
                    element={
                      <>
                        <NavbarWrapper />
                        <Unauthorized />
                        <Footer />
                      </>
                    }
                  />

                  {/* Auth Routes - WITH Navbar */}
                  <Route
                    path="/login"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <Login />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <Register />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route
                    path="/mfa-verify"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <MFAVerify />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route
                    path="/check-email"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <CheckEmail />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route
                    path="/verify-email"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <VerifyEmail />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <ForgotPassword />
                        </PublicOnly>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <>
                        <NavbarWrapper />
                        <PublicOnly>
                          <ResetPassword />
                        </PublicOnly>
                      </>
                    }
                  />
                  <Route path="/oauth-callback" element={<OAuthCallback />} />

                  {/* User Profile - Protected */}
                  <Route
                    path="/profile"
                    element={
                      <>
                        <NavbarWrapper />
                        <RequireAuth>
                          <CustomerOnly>
                            <Profile />
                          </CustomerOnly>
                        </RequireAuth>
                        <Footer />
                      </>
                    }
                  />

                  {/* Protected Admin Routes - NO Navbar, uses AdminLayout */}
                  <Route
                    path="/admin/*"
                    element={
                      <RequireAuth>
                        <RequireRole allowedRoles={["admin"]}>
                          <AdminLayout />
                        </RequireRole>
                      </RequireAuth>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </IdleTimeoutWrapper>
          </Router>
        </ErrorBoundary>
        {/* {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
