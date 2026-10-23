import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar" style={{ width: '250px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Logo Area */}
      <div className="sidebar-logo" style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
        <h2 style={{ margin: 0 }}>ShopFree</h2>
      </div>

      {/* 2. Navigation Links */}
      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', padding: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Home</Link>
        <Link to="/profile" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Profile</Link>
        <Link to="/services" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Services</Link>
        <Link to="/contact" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Contact Us</Link>

        {/* Show Admin links ONLY if logged in */}
        {user && (
          <>
            <hr style={{ borderColor: '#334155', margin: '10px 0', width: '100%' }} />
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 5px 10px' }}>ADMIN</p>
            
            {/* 🚨 Dashboard Link belongs here */}
            <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Dashboard</Link>
            <Link to="/admin/products" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Products</Link>
            <Link to="/admin/AdminOrders" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Orders</Link>
            <Link to="/admin/messages" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Messages</Link>
          </>
        )}

        <hr style={{ borderColor: '#334155', margin: '10px 0', width: '100%' }} />
        
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Cart</Link>
        <Link to="/wishlist" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Wishlist</Link>
      </nav>

      {/* 3. User Profile (Bottom) */}
      <div className="sidebar-user" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #334155' }}>
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" 
          alt="User" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user ? (user.displayName || user.email) : 'Guest'}
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
            {user ? 'Admin' : 'Visitor'}
          </p>
        </div>
        
        {user && (
          <button 
            onClick={logout} 
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px' }}
            title="Logout"
          >
            <i className="bx bx-log-out" />
            ↪
          </button>
        )}
      </div>
    </aside>
  );
}