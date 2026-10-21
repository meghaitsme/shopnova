import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <div style={{ fontSize: '60px', color: 'green' }}>✓</div>
      <h1 style={{ color: '#333' }}>Order Placed Successfully!</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Thank you for shopping with ShopNova. Your order is being processed and will be delivered soon.
      </p>
      <Link 
        to="/products" 
        style={{ backgroundColor: '#2874f0', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}