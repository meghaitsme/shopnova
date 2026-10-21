import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.uid) return;
      
      console.log("🔍 [Profile] Fetching orders for UID:", user.uid);
      try {
        // Query Firestore for orders where userId matches the logged-in user
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const myOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`✅ [Profile] Found ${myOrders.length} orders.`);
        setOrders(myOrders);
      } catch (error) {
        console.error("❌ [Profile] Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Please log in to view your profile.</h2>
        <Link to="/login" style={{ color: '#2874f0' }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* User Info Card */}
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>My Profile</h2>
        <p style={{ margin: '5px 0', color: '#555' }}><strong>Email:</strong> {user.email}</p>
        <p style={{ margin: '5px 0', color: '#555' }}><strong>Name:</strong> {user.displayName || 'N/A'}</p>
      </div>

      {/* My Orders Section */}
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>My Orders</h2>
      
      {loading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" style={{ color: '#2874f0', fontWeight: 'bold' }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Order ID: <strong>{order.id.substring(0, 8)}</strong></span>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                  backgroundColor: order.status === 'Pending' ? '#fef3c7' : '#d1fae5',
                  color: order.status === 'Pending' ? '#b45309' : '#065f46'
                }}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Total Amount:</strong> {formatPrice(order.totalAmount)}</p>
                  <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>Deliver to: {order.customerName}, {order.address}</p>
                </div>
                <div>
                  <Link to={`/product/${order.items[0]?._id}`} style={{ color: '#2874f0', fontSize: '14px' }}>
                    View Items
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}