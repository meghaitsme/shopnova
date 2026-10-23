import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customerEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  };

  // ✅ NEW: Handle Order Cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Cancelled' });
      alert("Order cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Please log in to view your profile.</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>My Profile</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>Logged in as: <strong>{user.email}</strong></p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      {/* Order History */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Order History</h2>

      {loading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>You haven't placed any orders yet.</p>
          <Link to="/products" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
              
              {/* Order Header Row */}
              <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Order Placed</p>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Total</p>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>₹{Number(order.total).toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Order ID</p>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>{order.id}</p>
                </div>
                <div>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : order.status === 'Shipped' ? '#dbeafe' : '#fef9c3',
                    color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : order.status === 'Shipped' ? '#1e40af' : '#854d0e'
                  }}>
                    {order.status || 'Pending'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* ✅ NEW: Cancel Button (Only shows if Pending) */}
                  {order.status === 'Pending' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '4px', cursor: cancellingId === order.id ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    style={{ background: 'none', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Expandable Order Details */}
              {expandedOrder === order.id && (
                <div style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#374151' }}>Items in this order:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                        {item.imageUrl || item.image ? (
                          <img src={item.imageUrl || item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Shipping Address:</strong> {order.address}</p>
                    <p style={{ margin: 0, fontSize: '14px' }}><strong>Phone:</strong> {order.phone}</p>
                    {order.couponUsed && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981' }}>
                        <strong>Coupon Applied:</strong> {order.couponUsed} (-₹{order.discountApplied})
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}