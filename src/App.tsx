import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';

// Public Pages
import Home from './pages/customer/Home';
import PLP from './pages/customer/PLP';
import PDP from './pages/customer/PDP';
import Cart from './pages/customer/Cart';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register'; 
import Profile from './pages/customer/Profile';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import Wishlist from './pages/customer/Wishlist';

// Admin Pages
import AddProduct from './pages/AddProduct';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import AdminProducts from './pages/admin/AdminProducts'; // 👈 1. ADD IMPORT HERE
import AdminCoupons from './pages/admin/AdminCoupons';

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@test.com';

  return (
    <Routes>
      {/* PUBLIC BUYER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<PLP />} />
      <Route path="/product/:id" element={<PDP />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/profile" element={<Profile />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/wishlist" element={<Wishlist />} />

      {/* PROTECTED ADMIN ROUTES */}
      <Route path="/admin/add-product" element={isAdmin ? <AddProduct /> : <Navigate to="/login" />} />
      <Route path="/admin/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/orders" element={isAdmin ? <Orders /> : <Navigate to="/login" />} />
      
      {/* 👈 2. ADD THIS ROUTE HERE */}
      <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Navigate to="/login" />} />
      <Route path="/admin/coupons" element={isAdmin ? <AdminCoupons /> : <Navigate to="/login" />} />
      
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}