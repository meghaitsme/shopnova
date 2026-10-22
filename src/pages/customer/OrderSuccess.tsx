import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div style={{ padding: '50px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '80px', color: '#10b981', marginBottom: '20px' }}>✓</div>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>Order Placed Successfully!</h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px', maxWidth: '500px' }}>
        Thank you for shopping with ShopNova. Your order has been confirmed and is being processed. You will receive an email with tracking details soon.
      </p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link 
          to="/products" 
          style={{ backgroundColor: '#2874f0', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
          Continue Shopping
        </Link>
        <Link 
          to="/profile" 
          style={{ backgroundColor: '#fb641b', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}