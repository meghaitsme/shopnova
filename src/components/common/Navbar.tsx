import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart(); // Or whatever your cart count variable is
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.isAdmin;

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
      setIsMobileMenuOpen(false);
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Reusable styles for links
  const linkStyle = { color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' };
  const mobileLinkStyle = { ...linkStyle, display: 'block', padding: '12px 16px', borderBottom: '1px solid #1f2937' };

  return (
    <nav style={{ backgroundColor: '#0f172a', padding: '16px 24px', color: 'white', fontFamily: 'sans-serif', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* LOGO */}
        <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>⚡ ShopNova</span>
        </Link>

        {/* DESKTOP MENU */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-menu">
          
          <Link to="/wishlist" style={linkStyle}>❤️ Wishlist</Link>
          <Link to="/cart" style={linkStyle}>Cart ({itemCount || 0})</Link>

          {isAdmin && (
            <>
              <Link to="/admin/dashboard" style={linkStyle}>Dashboard</Link>
              <Link to="/admin/products" style={linkStyle}>Manage Products</Link>
              <Link to="/admin/orders" style={linkStyle}>Orders</Link>
              <Link to="/admin/coupons" style={linkStyle}>Coupons</Link>
              <Link to="/admin/users" style={linkStyle}>Users</Link>
              <Link to="/admin/reviews" style={linkStyle}>Reviews</Link>
              <Link to="/admin/subscribers" style={linkStyle}>Subscribers</Link>
            </>
          )}

          {user ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', borderLeft: '1px solid #334155', paddingLeft: '16px' }}>
              <Link to="/profile" style={linkStyle}>Hi, {user.email?.split('@')[0]}</Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" style={{ ...linkStyle, backgroundColor: '#2563eb', padding: '8px 16px', borderRadius: '6px' }}>Login</Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON (Hamburger) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer' }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }} className="mobile-dropdown">
          <Link to="/wishlist" onClick={closeMenu} style={mobileLinkStyle}>❤️ Wishlist</Link>
          <Link to="/cart" onClick={closeMenu} style={mobileLinkStyle}>Cart ({itemCount || 0})</Link>

          {isAdmin && (
            <>
              <Link to="/admin/dashboard" onClick={closeMenu} style={mobileLinkStyle}>Dashboard</Link>
              <Link to="/admin/products" onClick={closeMenu} style={mobileLinkStyle}>Manage Products</Link>
              <Link to="/admin/orders" onClick={closeMenu} style={mobileLinkStyle}>Orders</Link>
              <Link to="/admin/coupons" onClick={closeMenu} style={mobileLinkStyle}>Coupons</Link>
              <Link to="/admin/users" onClick={closeMenu} style={mobileLinkStyle}>Users</Link>
              
            </>
          )}

          {user ? (
            <>
              <Link to="/profile" onClick={closeMenu} style={mobileLinkStyle}>Hi, {user.email?.split('@')[0]}</Link>
              <button onClick={handleLogout} style={{ ...mobileLinkStyle, background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', color: '#ef4444' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} style={mobileLinkStyle}>Login</Link>
          )}
        </div>
      )}

      {/* CSS for responsive behavior */}
      <style>
        {`
          @media (max-width: 900px) {
            .desktop-menu { display: none !important; }
            .mobile-menu-btn { display: block !important; }
          }
          @media (min-width: 901px) {
            .mobile-dropdown { display: none !important; }
          }
        `}
      </style>
    </nav>
  );
}