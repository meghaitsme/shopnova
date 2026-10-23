import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      
      {/* Green Checkmark Icon (SVG) */}
      <div style={{ 
        width: '80px', 
        height: '80px', 
        backgroundColor: '#dcfce7', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>
        Order Confirmed!
      </h1>
      
      <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '400px', margin: '0 0 32px 0', lineHeight: '1.5' }}>
        Thank you for your purchase. We've received your order and are getting it ready for shipment.
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link 
          to="/" 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px', 
            fontWeight: 'bold' 
          }}
        >
          Continue Shopping
        </Link>
        
        <Link 
          to="/profile" 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: 'white', 
            color: '#374151', 
            textDecoration: 'none', 
            borderRadius: '6px', 
            fontWeight: 'bold',
            border: '1px solid #d1d5db'
          }}
        >
          View My Orders
        </Link>
      </div>

    </div>
  );
}