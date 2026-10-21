import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    console.log("🔍 [Admin] Fetching orders from Firebase...");
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort orders by newest first (if createdAt exists)
      ordersData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      console.log(`✅ [Admin] Found ${ordersData.length} orders.`);
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ [Admin] Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 [Admin] Updating order ${orderId} to ${newStatus}...`);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      // Update local state so the UI refreshes instantly
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      alert("Order status updated!");
    } catch (error) {
      console.error("❌ [Admin] Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Admin Navigation */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <Link to="/admin/add-product" style={{ padding: '5px 15px', backgroundColor: '#2874f0', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          + Add New Product
        </Link>
      </div>

      <h3>Customer Orders ({orders.length})</h3>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Order ID</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Customer Details</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Items</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Total</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  
                  {/* Order ID */}
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {order.id.substring(0, 8)}...
                  </td>

                  {/* Customer Details */}
                  <td style={{ padding: '12px' }}>
                    <strong>{order.customerName}</strong><br/>
                    <span style={{ fontSize: '12px', color: '#666' }}>{order.phone}</span><br/>
                    <span style={{ fontSize: '12px', color: '#666' }}>{order.address}</span>
                  </td>

                  {/* Items */}
                  <td style={{ padding: '12px' }}>
                    <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '14px' }}>
                      {order.items.map((item: any, index: number) => (
                        <li key={index}>{item.name} (x{item.quantity || 1})</li>
                      ))}
                    </ul>
                  </td>

                  {/* Total */}
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {formatPrice(order.totalAmount)}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: order.status === 'Pending' ? '#fef3c7' : order.status === 'Shipped' ? '#dbeafe' : '#d1fae5',
                      color: order.status === 'Pending' ? '#b45309' : order.status === 'Shipped' ? '#1e40af' : '#065f46'
                    }}>
                      {order.status}
                    </span>
                  </td>

                  {/* Action Dropdown */}
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
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