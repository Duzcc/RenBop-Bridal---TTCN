import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';

import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Feedback from './pages/Feedback';
import BlogList from './pages/BlogList';
import BlogArticle from './pages/BlogArticle';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageFittingSessions from './pages/admin/ManageFittingSessions';
import ManageTailoringOrders from './pages/admin/ManageTailoringOrders';
import ManageReturns from './pages/admin/ManageReturns';
import ManagePayments from './pages/admin/ManagePayments';
import ManageCategories from './pages/admin/ManageCategories';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            {/* Standalone routes (No Header/Footer) */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Protected Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index                    element={<AdminOverview />} />
                    <Route path="dashboard"         element={<AdminOverview />} />
                    <Route path="products"           element={<ManageProducts />} />
                    <Route path="orders"             element={<ManageOrders />} />
                    <Route path="users"              element={<ManageCustomers />} />
                    <Route path="fitting-sessions"  element={<ManageFittingSessions />} />
                    <Route path="tailoring-orders"  element={<ManageTailoringOrders />} />
                    <Route path="returns"            element={<ManageReturns />} />
                    <Route path="payments"           element={<ManagePayments />} />
                    <Route path="categories"         element={<ManageCategories />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />

            {/* Main Application Routes with Layout */}
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Collections */}
                  <Route path="/collections/:slug" element={<Collection />} />
                  <Route path="/collections/all" element={<Collection />} />

                  {/* Product detail */}
                  <Route path="/products/:id" element={<ProductDetail />} />

                  {/* Feedback */}
                  <Route path="/pages/feedback" element={<Feedback />} />

                  {/* Blog */}
                  <Route path="/blogs/news" element={<BlogList />} />
                  <Route path="/blogs/news/:slug" element={<BlogArticle />} />

                  {/* Static pages */}
                  <Route path="/pages/about" element={<About />} />
                  <Route path="/pages/contact" element={<About />} />

                  {/* Checkout & Payment */}
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-result" element={<PaymentResult />} />

                  {/* Cart */}
                  <Route path="/cart" element={<Cart />} />

                  {/* Protected routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Order history */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
