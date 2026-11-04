import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // 1. Fetch ALL orders from all users
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Function to update the status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update order status", "error");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading all orders...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Manage Orders</h1>
        <span style={{ backgroundColor: '#e5e7eb', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
          Total Orders: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280' }}>No orders have been placed yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>Order Details</th>
                <th style={{ padding: '16px' }}>Customer</th>
                <th style={{ padding: '16px' }}>Items</th>
                <th style={{ padding: '16px' }}>Total</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                  
                  {/* Order ID & Date */}
                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontFamily: 'monospace' }}>#{order.id.slice(-6).toUpperCase()}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </td>

                  {/* Customer Info */}
                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{order.customerEmail || order.userEmail}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>{order.phoneNumber || order.phone || 'No phone'}</p>
                  </td>

                  {/* Items Count */}
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {order.items?.length || 0} items
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#111827' }}>
                    ₹{Number(order.totalAmount || order.total || 0).toFixed(2)}
                  </td>

                  {/* Current Status Badge */}
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : order.status === 'Shipped' ? '#dbeafe' : '#fef9c3',
                      color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : order.status === 'Shipped' ? '#1e40af' : '#854d0e'
                    }}>
                      {order.status || 'Pending'}
                    </span>
                  </td>

                  {/* Dropdown to Change Status */}
                  <td style={{ padding: '16px' }}>
                    <select 
                      value={order.status || 'Pending'} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}