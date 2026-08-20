import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import { isMobileDevice } from './utils/mobileDetection';

// Auth pages (no nav/footer)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Public pages
import HomePage from './pages/main/HomePage';
import SearchPage from './pages/main/SearchPage';
import CategoryPage from './pages/main/CategoryPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import MobileDownloadPage from './pages/MobileDownloadPage';

// Auth-required pages
import WishlistPage from './pages/main/WishlistPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PaymentPage from './pages/checkout/PaymentPage';
import PaymentCallbackPage from './pages/checkout/PaymentCallbackPage';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage';
import OrdersPage from './pages/order/OrdersPage';
import OrderDetailPage from './pages/order/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';
import AddressesPage from './pages/profile/AddressesPage';
import NotificationsPage from './pages/profile/NotificationsPage';

/** Redirect to /login preserving the attempted URL */
function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/** Redirect already-logged-in users away from auth pages */
function RedirectIfAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/** Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { isLoading, initAuth } = useAuthStore();
  const [showMobilePage, setShowMobilePage] = useState(false);

  useEffect(() => {
    initAuth();

    // If already running as installed PWA (standalone) — never show download page
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setShowMobilePage(false);
      return;
    }

    // If user explicitly chose to use the web version — skip download page
    const useWebVersion = localStorage.getItem('useWebVersion');
    if (useWebVersion) {
      setShowMobilePage(false);
      return;
    }

    // Show download page only for non-desktop mobile browsers
    const mobile = isMobileDevice();
    setShowMobilePage(mobile);
  }, [initAuth]);

  // Show a minimal splash while reading localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl p-2">
            <img src="/icons/logo.PNG" alt="Jibam Pharmacy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <p className="text-4xl font-black text-white tracking-widest">JIBAM</p>
          <p className="text-lg font-bold text-accent tracking-[0.3em]">PHARMACY</p>
        </div>
        <div className="w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Show mobile download page for mobile users
  if (showMobilePage) {
    return <MobileDownloadPage />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Auth pages (no layout wrapper) ─────────────────────── */}
        <Route path="/login" element={
          <RedirectIfAuth><LoginPage /></RedirectIfAuth>
        } />
        <Route path="/register" element={
          <RedirectIfAuth><RegisterPage /></RedirectIfAuth>
        } />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Public pages with layout ────────────────────────────── */}
        <Route path="/" element={
          <Layout><HomePage /></Layout>
        } />
        <Route path="/search" element={
          <Layout><SearchPage /></Layout>
        } />
        <Route path="/category/:categoryId" element={
          <Layout><CategoryPage /></Layout>
        } />
        <Route path="/products/:productId" element={
          <Layout><ProductDetailPage /></Layout>
        } />

        {/* ── Auth-required pages ─────────────────────────────────── */}
        <Route path="/wishlist" element={
          <RequireAuth><Layout><WishlistPage /></Layout></RequireAuth>
        } />
        <Route path="/cart" element={
          <RequireAuth><Layout><CartPage /></Layout></RequireAuth>
        } />
        <Route path="/checkout" element={
          <RequireAuth><Layout><CheckoutPage /></Layout></RequireAuth>
        } />
        <Route path="/payment" element={
          <RequireAuth><Layout><PaymentPage /></Layout></RequireAuth>
        } />
        <Route path="/payment/callback" element={
          <RequireAuth><PaymentCallbackPage /></RequireAuth>
        } />
        <Route path="/order-success" element={
          <RequireAuth><Layout><OrderSuccessPage /></Layout></RequireAuth>
        } />
        <Route path="/orders" element={
          <RequireAuth><Layout><OrdersPage /></Layout></RequireAuth>
        } />
        <Route path="/orders/:orderId" element={
          <RequireAuth><Layout><OrderDetailPage /></Layout></RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth><Layout><ProfilePage /></Layout></RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth><Layout><SettingsPage /></Layout></RequireAuth>
        } />
        <Route path="/addresses" element={
          <RequireAuth><Layout><AddressesPage /></Layout></RequireAuth>
        } />
        <Route path="/notifications" element={
          <RequireAuth><Layout><NotificationsPage /></Layout></RequireAuth>
        } />

        {/* ── 404 fallback ────────────────────────────────────────── */}
        <Route path="*" element={
          <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
              <p className="text-6xl font-black text-primary-surface">404</p>
              <h2 className="text-xl font-bold text-primary">Page Not Found</h2>
              <p className="text-gray-500 text-sm">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary px-8 mt-2">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </>
  );
}
