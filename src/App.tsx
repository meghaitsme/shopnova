import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar'; // Assuming you have this

// Public Pages
import Home from './pages/customer/Home';
import PLP from './pages/customer/PLP';
import PDP from './pages/customer/PDP';
import Cart from './pages/customer/Cart';
import Login from './pages/customer/Login';
import Profile from './pages/customer/Profile';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';

// Admin Pages
import AddProduct from './pages/AddProduct';
import Dashboard from './pages/admin/Dashboard';

// 1. Create a separate component for your routes
function AppRoutes() {
  const { user } = useAuth();
  
  // Check if the user is the admin
  const isAdmin = user?.email === 'admin@test.com'; 

  console.log("👤 [App] Current User:", user?.email, "| Is Admin:", isAdmin);

  return (
    <Routes>
      {/* PUBLIC BUYER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<PLP />} />
      <Route path="/product/:id" element={<PDP />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
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
  );
}

// 2. The main App component just renders the Router and Navbar
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes /> {/* Use the component we created above */}
    </BrowserRouter>
  );
}