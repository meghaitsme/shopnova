import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ScrollToTop from './components/common/ScrollToTop';

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
import Contact from './pages/customer/Contact';

// We don't need OrderHistory anymore since it's inside Profile, 
// but I left the import in case you still want a separate page.
import OrderHistory from './pages/customer/OrderHistory';
import Invoice from './pages/customer/Invoice';

// Admin Pages
import AddProduct from './pages/AddProduct';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import EditProduct from './pages/admin/EditProduct';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import AdminMessages from './pages/admin/AdminMessages';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  const isAdmin = Boolean(user && 'isAdmin' in user && user.isAdmin);

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
      <Route path="/contact" element={<Contact />} />
      
      {/* CUSTOMER ORDER ROUTES */}
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/invoice/:id" element={<Invoice />} />

      {/* PROTECTED ADMIN ROUTES */}
      <Route path="/admin/add-product" element={isAdmin ? <AddProduct /> : <Navigate to="/login" />} />
      <Route path="/admin/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={isAdmin ? <AdminUsers /> : <Navigate to="/login" />} />
      <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Navigate to="/login" />} />
      <Route path="/admin/coupons" element={isAdmin ? <AdminCoupons /> : <Navigate to="/login" />} />
      
      {/* We only need AdminOrders once, and only for admins */}
      <Route path="/admin/orders" element={isAdmin ? <AdminOrders /> : <Navigate to="/login" />} />
      <Route path="/admin/reviews" element={isAdmin ? <AdminReviews /> : <Navigate to="/login" />} />
      <Route path="/admin/subscribers" element={isAdmin ? <AdminSubscribers /> : <Navigate to="/login" />} />
      <Route path="/admin/edit-product/:id" element={isAdmin ? <EditProduct /> : <Navigate to="/login" />} />
      
      <Route path="/admin/messages" element={isAdmin ? <AdminMessages /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}