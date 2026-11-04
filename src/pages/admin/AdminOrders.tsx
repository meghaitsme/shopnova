import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
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

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      // Update the UI instantly
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (loading) return <div style={{ padding: '50px' }}>Loading orders...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Manage Orders</h1>
      <p>Total Orders: {orders.length}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#fff' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
              <div>
                <strong>Order ID:</strong> {order.id} <br/>
                <strong>Customer:</strong> {order.userEmail} <br/>
                <strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Total:</strong> ₹{order.totalAmount} <br/>
                <strong>Status:</strong> 
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <strong>Shipping Details:</strong>
              <p style={{ margin: '5px 0' }}>{order.shippingAddress}</p>
              <p style={{ margin: '5px 0' }}>Phone: {order.phoneNumber}</p>
            </div>

            <div style={{ marginTop: '10px' }}>
              <strong>Items:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {order.items.map((item: any, index: number) => (
                  <li key={index}>{item.name} (x{item.quantity}) - ₹{item.price}</li>
                ))}
              </ul>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;