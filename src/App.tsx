import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Customer Pages
import Home from './pages/customer/Home';
import PLP from './pages/customer/PLP';
import PDP from './pages/customer/PDP';
import Wishlist from './pages/customer/Wishlist';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import Profile from './pages/customer/Profile';
import Services from './pages/customer/Services';
import Contact from './pages/customer/Contact';
import ServiceDetail from './pages/customer/ServiceDetail';

// Admin Pages
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/Orders';
import AdminMessages from './pages/admin/Messages';
import Dashboard from './pages/admin/Dashboard';

// Settings Pages
import AccountSettings from './pages/settings/Account';
import NotificationSettings from './pages/settings/Notifications';
import PaymentSettings from './pages/settings/Payment';
import PrivacySettings from './pages/settings/Privacy';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

// We separate the layout so it can use useAuth() inside the Router
function AppLayout() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<PLP />} />
            <Route path="/product/:id" element={<PDP />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
            <Route path="/order-success" element={user ? <OrderSuccess /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            
            {/* Settings Routes */}
            <Route path="/settings/account" element={user ? <AccountSettings /> : <Navigate to="/login" />} />
            <Route path="/settings/notifications" element={user ? <NotificationSettings /> : <Navigate to="/login" />} />
            <Route path="/settings/payment" element={user ? <PaymentSettings /> : <Navigate to="/login" />} />
            <Route path="/settings/privacy" element={user ? <PrivacySettings /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/messages" element={<AdminMessages />} />

            {/* Fallback */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}