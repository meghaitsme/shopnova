import { useEffect, useState } from 'react';
import { db } from '../../data/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // 1. Fetch all orders from Firebase
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const items = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      
      // 2. Sort newest first
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(items);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 3. Update status in Firebase
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      // Update the UI instantly
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Admin Orders</h1>
      
      {orders.length === 0 ? (
        <p>No orders have been placed yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2563eb' }}>{formatPrice(order.total)}</h3>
                  
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ 
                      padding: '5px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'Processing' ? '#fef3c7' : order.status === 'Shipped' ? '#dbeafe' : '#dcfce7'
                    }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '40px', marginBottom: '15px' }}>
                <div>
                  <strong>Customer:</strong> <br />
                  {order.userEmail || 'Guest'}
                </div>
                <div>
                  <strong>Ship To:</strong> <br />
                  {order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
                </div>
              </div>

              <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                <strong>Items:</strong>
                {order.items.map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '14px' }}>
                    <span>{item.quantity} x {item.product?.name}</span>
                    <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}