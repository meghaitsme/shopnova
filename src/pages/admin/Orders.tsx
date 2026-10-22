import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert("Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 🚨 Helper to safely format price
  const safePrice = (price: any) => {
    const num = Number(price);
    if (isNaN(num) || num === undefined || num === null) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // 🚨 Helper to safely format dates
  const safeDate = (dateObj: any) => {
    if (!dateObj) return 'Just now';
    // If it's a Firebase Timestamp
    if (dateObj.toDate) return dateObj.toDate().toLocaleDateString();
    // If it's a standard string
    if (typeof dateObj === 'string') return new Date(dateObj).toLocaleDateString();
    return 'Just now';
  };

  if (loading) return <p style={{ padding: '50px', textAlign: 'center' }}>Loading orders...</p>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Admin Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <p>No orders found yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Order #{order.id.substring(0, 6).toUpperCase()}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{safeDate(order.createdAt)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2563eb', fontSize: '20px' }}>
                    {safePrice(order.totalAmount)}
                  </h3>
                  <select 
                    value={order.status || 'Pending'} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'Pending' ? '#fef3c7' : '#d1fae5'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>Customer:</p>
                  <p style={{ margin: 0, color: '#555' }}>{order.customerName || order.userId || 'Guest'}</p>
                  <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>{order.phone || 'No phone'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>Ship To:</p>
                  <p style={{ margin: 0, color: '#555' }}>{order.address || 'No address provided'}</p>
                </div>
              </div>

              {/* Items */}
              <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' }}>Items:</p>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                      <span>{item.name || 'Unknown Product'} x {item.quantity || 1}</span>
                      <span style={{ fontWeight: 'bold' }}>{safePrice(item.price)}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>No item details available for this order.</p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}