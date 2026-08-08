import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicOnlyRoute } from './components/RoleGuard';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { VendorLayout } from './layouts/VendorLayout';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VendorSignup } from './pages/VendorSignup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Admin / Ops Pages (existing)
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Assets } from './pages/Assets';
import { Rentals } from './pages/Rentals';
import { RentalDetail } from './pages/RentalDetail';
import { Fulfillment } from './pages/Fulfillment';
import { Returns } from './pages/Returns';
import { Inspections } from './pages/Inspections';
import { Adjustments } from './pages/Adjustments';

// Customer Storefront Pages
import { StoreHome } from './pages/store/StoreHome';
import { ProductDetail } from './pages/store/ProductDetail';
import { Cart } from './pages/store/Cart';
import { CheckoutAddress } from './pages/store/CheckoutAddress';
import { Payment } from './pages/store/Payment';
import { OrderSuccess } from './pages/store/OrderSuccess';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ──────────────────────────────────────────────────────
              PUBLIC AUTH ROUTES
              Wrapped with PublicOnlyRoute — authenticated users
              are bounced to their correct portal automatically.
          ────────────────────────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <PublicOnlyRoute><Login /></PublicOnlyRoute>
            } />
            <Route path="/signup" element={
              <PublicOnlyRoute><Signup /></PublicOnlyRoute>
            } />
            <Route path="/vendor-signup" element={
              <PublicOnlyRoute><VendorSignup /></PublicOnlyRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* ──────────────────────────────────────────────────────
              DEFAULT REDIRECT
              Root always redirects to /login (auth check in each
              portal layout handles further routing).
          ────────────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ──────────────────────────────────────────────────────
              CUSTOMER STOREFRONT ROUTES
              CustomerLayout embeds its own auth + role gate.
              Only role='customer' can reach these.
          ────────────────────────────────────────────────────── */}
          <Route path="/store" element={<CustomerLayout />}>
            <Route index element={<StoreHome />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<CheckoutAddress />} />
            <Route path="payment" element={<Payment />} />
            <Route path="success" element={<OrderSuccess />} />
          </Route>

          {/* ──────────────────────────────────────────────────────
              VENDOR PORTAL ROUTES
              VendorLayout embeds RoleGuard(vendor, admin).
          ────────────────────────────────────────────────────── */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            {/* Vendor-specific pages (to be implemented) */}
            <Route path="products" element={<Products />} />
            <Route path="assets" element={<Assets />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="rentals/:id" element={<RentalDetail />} />
            <Route path="customers" element={<Customers />} />
          </Route>

          {/* ──────────────────────────────────────────────────────
              ADMIN PORTAL ROUTES
              MainLayout embeds its own role gate:
              redirects vendor → /vendor/dashboard
              redirects customer → /store
          ────────────────────────────────────────────────────── */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="assets" element={<Assets />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="rentals/:id" element={<RentalDetail />} />
            <Route path="fulfillment" element={<Fulfillment />} />
            <Route path="returns" element={<Returns />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="adjustments" element={<Adjustments />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
