import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <h1 style={{ color: '#16a34a', marginTop: 20 }}>Order Placed Successfully!</h1>
      <p style={{ fontSize: 18, marginTop: 12, color: '#374151' }}>
        Thank you for your purchase. We'll process your order shortly.
      </p>
      <Link
        to="/"
        className="btn-primary"
        style={{ display: 'inline-block', marginTop: 32, padding: '14px 32px' }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}