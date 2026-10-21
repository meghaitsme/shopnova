import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  // Safe Cart calculation
  let itemCount = 0;
  if (Array.isArray(cart)) {
    itemCount = cart.reduce((count: number, item: any) => count + (item.quantity || 1), 0);
  } else if (cart?.items && Array.isArray(cart.items)) {
    itemCount = cart.items.reduce((count: number, item: any) => count + item.quantity, 0);
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    // 🚨 NAV BAR CONTAINER (Flexbox, Dark Background)
    <nav style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: '#0f172a', // Dark blue
      padding: '15px 30px',
      color: 'white',
      position: 'relative',
      zIndex: 100
    }}>
      
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        <img src="/logo.svg" alt="ShopNova Logo" style={{ height: '30px' }} />
        <span>ShopNova</span>
      </Link>

      {/* Right Side Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px', fontSize: '15px' }}>
        
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Cart ({itemCount})
        </Link>

        {isAdmin && (
          <Link to="/admin/dashboard" style={{ color: '#facc15', textDecoration: 'none', fontWeight: 'bold' }}>
            Admin Dashboard
          </Link>
        )}

        {/* Settings Dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '15px'
            }}
          >
            <i className="bx bx-cog" /> Settings
            <i className={`bx bx-chevron-down ${menuOpen ? 'rotate' : ''}`} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '140%',
              right: 0,
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              width: '220px',
              zIndex: 1000,
              padding: '10px 0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenu} style={{ padding: '12px 20px', textDecoration: 'none', color: 'black', display: 'flex', gap: '10px' }}>
                    <i className="bx bx-user" /> My Profile
                  </Link>
                  <Link to="/settings/account" onClick={closeMenu} style={{ padding: '12px 20px', textDecoration: 'none', color: 'black', display: 'flex', gap: '10px' }}>
                    <i className="bx bx-cog" /> Account Settings
                  </Link>
                  <Link to="/settings/payment" onClick={closeMenu} style={{ padding: '12px 20px', textDecoration: 'none', color: 'black', display: 'flex', gap: '10px' }}>
                    <i className="bx bx-credit-card" /> Payment Methods
                  </Link>
                  <div style={{ height: '1px', backgroundColor: '#eee', margin: '5px 0' }} />
                  <button onClick={handleLogout} style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '10px', fontSize: '15px' }}>
                    <i className="bx bx-log-out" /> Logout
                  </button>
                </>
              ) : (
                <div style={{ padding: '10px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', textAlign: 'center' }}>Welcome!</p>
                  <Link to="/login" onClick={closeMenu} style={{ display: 'block', textAlign: 'center', background: '#2563eb', color: 'white', padding: '10px', borderRadius: '4px', textDecoration: 'none', marginBottom: '5px' }}>
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMenu} style={{ display: 'block', textAlign: 'center', color: '#2563eb', padding: '10px', textDecoration: 'none' }}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {user ? (
          <span style={{ color: '#cbd5e1' }}>Hi, {user.displayName || user.email}</span>
        ) : (
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}