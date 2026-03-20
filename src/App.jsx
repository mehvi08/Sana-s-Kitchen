import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Cart from './pages/Cart.jsx';
import Profile from './pages/Profile.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import MenuItemDetail from './pages/MenuItemDetail.jsx';
import { AdminLayout } from './features/admin/AdminLayout.jsx';
import { Overview } from './features/admin/Overview.jsx';
import { MenuManagement } from './features/admin/MenuManagement.jsx';
import { OrderManagement } from './features/admin/OrderManagement.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-brand-sand text-brand-maroon font-sans">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/item/:id" element={<MenuItemDetail />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="orders" element={<OrderManagement />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

