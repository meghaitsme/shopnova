import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/customer/Home';
import PLP from './pages/customer/PLP';
import PDP from './pages/customer/PDP';
import Cart from './pages/customer/Cart';
import Login from './pages/customer/Login';
import Checkout from './pages/customer/Checkout'; // 👈 MISSING IMPORT ADDED
import OrderSuccess from './pages/customer/OrderSuccess';

// Admin Pages
import AddProduct from './pages/AddProduct';
import Dashboard from './pages/admin/Dashboard';

export default function App() {
  const { user } = useAuth();
  // If you are using a different admin email, change this:
  const isAdmin = user?.email === 'admin@test.com'; 

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC BUYER ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<PLP />} />
        <Route path="/product/:id" element={<PDP />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route 
          path="/admin/add-product" 
          element={isAdmin ? <AddProduct /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}