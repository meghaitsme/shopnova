import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjusted path!

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      // This assumes your backend is running locally on port 5000
      fetch(`http://localhost:5000/api/orders/my-orders/${user.uid}`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error("Error fetching orders:", err));
    }
  }, [user]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Your Order History</h2>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {orders.map((order: any) => (
            <div key={order._id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
              
              {/* ORDER HEADER (Date and Tracking) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <div>
                  <strong>Order ID:</strong> #{order._id.slice(-6).toUpperCase()}
                  <p style={{ color: 'gray', fontSize: '14px', margin: '5px 0 0 0' }}>
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span style={{ 
                    backgroundColor: order.status === 'Delivered' ? '#dcfce7' : '#fef08a',
                    color: order.status === 'Delivered' ? '#166534' : '#854d0e',
                    padding: '5px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' 
                  }}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div>
                {order.items.map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL & BILL BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  Total: ₹{order.totalAmount}
                </div>
                <Link 
                  to={`/invoice/${order._id}`} 
                  style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '5px', fontSize: '14px' }}
                >
                  View Bill / Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}