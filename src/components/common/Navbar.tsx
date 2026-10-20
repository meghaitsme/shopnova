import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

// 🚨 FIX 1: Calculate item count safely from cart.items
  const itemCount = cart?.items?.reduce((count: number, item: any) => count + item.quantity, 0) || 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <Link to="/" className="brand"><img src="/logo.svg" alt="" className="brand-logo-sm" /><span>ShopNova</span></Link>

      <div className="nav-links">
         {/* This will now show the correct count */}
        <Link to="/cart">Cart ({itemCount})</Link>

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/orders">Orders</Link>
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
              <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
                <i className="bx bx-user" />
                <span>My Profile</span>
              </Link>
              <Link to="/settings/account" className="dropdown-item" onClick={closeMenu}>
                <i className="bx bx-cog" />
                <span>Account Settings</span>
              </Link>
              <Link to="/settings/notifications" className="dropdown-item" onClick={closeMenu}>
                <i className="bx bx-bell" />
                <span>Notifications</span>
              </Link>
              <Link to="/settings/payment" className="dropdown-item" onClick={closeMenu}>
                <i className="bx bx-credit-card" />
                <span>Payment Methods</span>
              </Link>
              <Link to="/settings/privacy" className="dropdown-item" onClick={closeMenu}>
                <i className="bx bx-shield-quarter" />
                <span>Privacy</span>
              </Link>

              <div className="dropdown-divider" />

              {user ? (
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <i className="bx bx-log-out" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" className="dropdown-item" onClick={closeMenu}>
                  <i className="bx bx-log-in" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ---------- User name / Login links ---------- */}
        {user ? (
<span className="user-name">Hi, {user.displayName || user.email}</span>        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
