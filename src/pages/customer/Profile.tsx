import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚨 Profile Edit States
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      if (!user?.uid) return;
      
      try {
        // 1. Fetch user's profile data (Name, Address)
        const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const usersSnap = await getDocs(usersQuery);
        
        if (!usersSnap.empty) {
          const userData = usersSnap.docs[0].data();
          setDisplayName(userData.name || '');
          setAddress(userData.address || '');
          setPhone(userData.phone || '');
        }

        // 2. Fetch user's orders
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const ordersSnap = await getDocs(ordersQuery);
        const myOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(myOrders);

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setIsSaving(true);
    setMessage('');

    try {
      // Update the user's document in Firestore
      const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
      const usersSnap = await getDocs(usersQuery);
      
      if (!usersSnap.empty) {
        const docId = usersSnap.docs[0].id;
        await updateDoc(doc(db, 'users', docId), {
          name: displayName,
          address: address,
          phone: phone,
        });
        setMessage('✅ Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage('❌ Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Please log in to view your profile.</h2>
        <Link to="/login" style={{ color: '#2874f0' }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      
      {/* LEFT: EDIT PROFILE */}
      <div style={{ flex: '1', minWidth: '300px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Edit Profile</h2>
          
          {message && <p style={{ color: message.includes('✅') ? 'green' : 'red', fontSize: '14px' }}>{message}</p>}
          
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email (Read Only)</label>
            <input type="email" value={user.email} disabled style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }} />

            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Full Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Default Shipping Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />

            <button type="submit" disabled={isSaving} style={{ backgroundColor: '#2874f0', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: MY ORDERS */}
      <div style={{ flex: '1.5', minWidth: '300px' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}>My Orders</h2>
        
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
            <p>No orders yet.</p>
            <Link to="/products" style={{ color: '#2874f0' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Order ID: <strong>{order.id.substring(0, 8)}</strong></span>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: order.status === 'Pending' ? '#fef3c7' : '#d1fae5', color: order.status === 'Pending' ? '#b45309' : '#065f46' }}>
                    {order.status}
                  </span>
                </div>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Total:</strong> {formatPrice(order.totalAmount)}</p>
                <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>Deliver to: {order.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}