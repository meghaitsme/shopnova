import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  // 🚨 FIX 1: Safely calculate item count. 
  // Handles both array format (localStorage) and object format (backend)
  let itemCount = 0;
  if (Array.isArray(cart)) {
    itemCount = cart.reduce((count: number, item: any) => count + (item.quantity || 1), 0);
  } else if (cart?.items && Array.isArray(cart.items)) {
    itemCount = cart.items.reduce((count: number, item: any) => count + item.quantity, 0);
  }
  
  console.log("🛒 [Navbar] Current Cart State:", cart, "| Item Count:", itemCount);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if the user is the admin (You can change this to your specific admin email)
  const isAdmin = user?.email === 'admin@test.com'; 

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <img src="/logo.svg" alt="ShopNova Logo" className="brand-logo-sm" />
        <span>ShopNova</span>
      </Link>

      <div className="nav-links">
        {/* Always show the cart to buyers */}
        <Link to="/cart" style={{ fontWeight: 'bold' }}>Cart ({itemCount})</Link>

        {/* Show Admin links ONLY if the user is actually the admin */}
        {isAdmin && (
          <>
            <Link to="/admin/products" style={{ color: 'red' }}>Admin Products</Link>
            <Link to="/admin/orders" style={{ color: 'red' }}>Admin Orders</Link>
          </>
        )}

        {/* ---------- Settings dropdown ---------- */}
        <div className="nav-dropdown" ref={menuRef}>

          
          <button
            className={`nav-settings ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <i className="bx bx-cog" />
            <span>Settings</span>
            <i className={`bx bx-chevron-down dropdown-arrow ${menuOpen ? 'rotate' : ''}`} />
          </button>

          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              {/* If the user IS LOGGED IN, show all these settings */}
              {user ? (
                <>
                  <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
  <i className="bx bx-user" />
  <span>My Profile</span>
</Link>
                  <Link to="/settings/account" className="dropdown-item" onClick={closeMenu}>
                    <i className="bx bx-cog" />
                    <span>Account Settings</span>
                  </Link>
                  <Link to="/settings/payment" className="dropdown-item" onClick={closeMenu}>
                    <i className="bx bx-credit-card" />
                    <span>Payment Methods</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                /* If the user is a GUEST (buyer not logged in), only show Login/Register */
                <div style={{ padding: '10px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Welcome to ShopNova!</p>
                  <Link to="/login" className="dropdown-item" onClick={closeMenu} style={{ justifyContent: 'center', background: '#2563eb', color: 'white', borderRadius: '4px' }}>
                    <i className="bx bx-log-in" />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="dropdown-item" onClick={closeMenu} style={{ justifyContent: 'center', marginTop: '5px' }}>
                    <span>Create an Account</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- User name / Login links ---------- */}
        {user ? (
          <span className="user-name">Hi, {user.displayName || user.email}</span>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}