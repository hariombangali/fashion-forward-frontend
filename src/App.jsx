import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import MobileBottomNav from './components/common/MobileBottomNav';
import RouteLoader from './components/common/RouteLoader';
import AnnouncementBar from './components/common/AnnouncementBar';
import LiveNotifications from './components/common/LiveNotifications';
import FloatingContact from './components/common/FloatingContact';
import useSettingsStore from './store/settingsStore';
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import WholesalerApplyPage from './pages/auth/WholesalerApplyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import PrivacyPolicyPage from './pages/customer/PrivacyPolicyPage';
import ReturnPolicyPage from './pages/customer/ReturnPolicyPage';
import WishlistPage from './pages/customer/WishlistPage';

// Wholesaler Pages
import WholesaleShopPage from './pages/wholesaler/WholesaleShopPage';
import WholesaleDashboardPage from './pages/wholesaler/WholesaleDashboardPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminWholesalersPage from './pages/admin/AdminWholesalersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminThemePage from './pages/admin/AdminThemePage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

// Customer/Public Layout wrapper
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <LiveNotifications />
      <FloatingContact />
    </div>
  );
}

function App() {
  const { fetchUser, token } = useAuthStore();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
    // Load store settings (announcement, flash sale, contact info, theme)
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Router>
      <RouteLoader />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1a365d', color: '#fff', borderRadius: '10px' },
          success: { style: { background: '#059669' } },
          error: { style: { background: '#dc2626' } },
        }}
      />

      <Routes>
        {/* Auth Routes (no navbar/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/wholesale-apply" element={<WholesalerApplyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public / Customer Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
        <Route path="/shop/:category" element={<PublicLayout><ShopPage /></PublicLayout>} />
        <Route path="/product/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path="/return-policy" element={<PublicLayout><ReturnPolicyPage /></PublicLayout>} />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <PublicLayout><WishlistPage /></PublicLayout>
          </ProtectedRoute>
        } />

        {/* Protected Customer Routes — any logged-in user can access */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PublicLayout><CheckoutPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/order-success/:orderId" element={
          <ProtectedRoute>
            <PublicLayout><OrderSuccessPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <PublicLayout><MyOrdersPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <PublicLayout><OrderDetailPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <PublicLayout><ProfilePage /></PublicLayout>
          </ProtectedRoute>
        } />

        {/* Wholesaler Routes */}
        <Route path="/wholesale" element={
          <ProtectedRoute roles={['wholesaler']}>
            <PublicLayout><WholesaleShopPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/wholesale/dashboard" element={
          <ProtectedRoute roles={['wholesaler']}>
            <PublicLayout><WholesaleDashboardPage /></PublicLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="wholesalers" element={<AdminWholesalersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="theme" element={<ErrorBoundary><AdminThemePage /></ErrorBoundary>} />
          <Route path="coupons" element={<ErrorBoundary><AdminCouponsPage /></ErrorBoundary>} />
          <Route path="categories" element={<ErrorBoundary><AdminCategoriesPage /></ErrorBoundary>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
