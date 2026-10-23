import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, increment,setDoc } from 'firebase/firestore';

export default function Profile() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Profile Update State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        email: user.email,
        displayName: displayName,
        phone: phone 
      }, { merge: true });

      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

    const handleCancelOrder = async (orderId: string, items: any[]) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      // 1. Change order status to Cancelled
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Cancelled' });

      // 2. Restock the inventory
      for (const item of items) {
        const productRef = doc(db, 'products', item._id || item.productId);
        // Use Firebase increment to safely add the quantity back
        await updateDoc(productRef, {
          stock: increment(item.quantity)
        });
      }

      showToast("Order cancelled and items restocked.", "success");
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast("Failed to cancel order.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Please log in to view your profile.</div>;
  }

  // 🚨 Helper function for the timeline
  const renderTimeline = (status: string) => {
    const steps = ['Pending', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    
    if (status === 'Cancelled') {
      return (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#991b1b', fontWeight: 'bold', textAlign: 'center' }}>
          This order was cancelled.
        </div>
      );
    }

    return (
      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background Line */}
        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', backgroundColor: '#e5e7eb', zIndex: 0 }}></div>
        {/* Active Progress Line */}
        <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(Math.max(0, currentIndex) / 2) * 80}%`, height: '4px', backgroundColor: '#10b981', zIndex: 1, transition: 'width 0.3s' }}></div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '33%' }}>
              <div style={{ 
                width: '34px', height: '34px', borderRadius: '50%', 
                backgroundColor: isCompleted ? '#10b981' : '#e5e7eb',
                color: isCompleted ? 'white' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', marginBottom: '8px',
                border: '4px solid white' // creates a gap between line and circle
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isCompleted ? '#111827' : '#9ca3af' }}>{step}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>My Account</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>Logged in as: <strong>{user.email}</strong></p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      {/* Profile Settings Form */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Profile Settings</h2>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Your Name"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number (for shipping)</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+91 98765 43210"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isUpdating}
            style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isUpdating ? 'not-allowed' : 'pointer', height: '42px' }}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
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
                  {order.status === 'Pending' && (
                    <button 
  onClick={() => handleCancelOrder(order.id, order.items)}
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
                  
                  {/* ✅ NEW: Order Tracking Timeline */}
                  <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase' }}>Order Status</h4>
                    {renderTimeline(order.status)}
                  </div>

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