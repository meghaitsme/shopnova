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
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import Orders from './pages/admin/Orders';
import EditProduct from './pages/admin/EditProduct'; // ✅ 1. Import added here

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  const isAdmin = user?.isAdmin;

  console.log("👤 [App] Current User:", user?.email, "| Is Admin:", isAdmin);

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
      <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Navigate to="/login" />} />
      <Route path="/admin/coupons" element={isAdmin ? <AdminCoupons /> : <Navigate to="/login" />} />
      <Route path="/admin/orders" element={isAdmin ? <Orders /> : <Navigate to="/login" />} />
      
      {/* ✅ 2. Add EditProduct Route here */}
      <Route path="/admin/edit-product/:id" element={isAdmin ? <EditProduct /> : <Navigate to="/login" />} />
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