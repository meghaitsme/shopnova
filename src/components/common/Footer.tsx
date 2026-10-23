import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#9ca3af', padding: '60px 20px 30px 20px', fontFamily: 'sans-serif', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Section: 4 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Column 1: Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>⚡ ShopNova</span>
            </Link>
            <p style={{ lineHeight: '1.6', fontSize: '14px', margin: '0 0 16px 0' }}>
              Your one-stop destination for quality products at unbeatable prices. Shop with confidence.
            </p>
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Shop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/products" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>All Products</Link>
              <Link to="/products?category=Electronics" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Electronics</Link>
              <Link to="/products?category=Clothing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Clothing</Link>
              <Link to="/products?category=Books" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Books</Link>
            </div>
          </div>

          {/* Column 3: Support Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link>
              <Link to="/profile" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>My Account</Link>
              <Link to="/profile" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Order Tracking</Link>
              <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Returns & Refunds</Link>
            </div>
          </div>

          {/* Column 4: Trust / Social */}
          <div>
            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Trust & Security</h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>🔒 SSL Secure</div>
              <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>✅ 100% Genuine</div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              We accept all major credit cards, UPI, and Cash on Delivery.
            </p>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px' }}>
            &copy; {new Date().getFullYear()} ShopNova. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</Link>
            <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}