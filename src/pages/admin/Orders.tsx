import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import emailjs from '@emailjs/browser'; // 👈 Import EmailJS

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
      // 1. Find the order
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      // 2. Update Firestore
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // 3. 🚨 SEND EMAIL
      if (orderToUpdate.buyerEmail) {
        const templateParams = {
          order_id: orderId.substring(0, 8).toUpperCase(),
          customer_name: orderToUpdate.customerName,
          status: newStatus,
          total_amount: `₹${orderToUpdate.totalAmount}`,
          to_email: orderToUpdate.buyerEmail,
        };

        console.log("📧 Sending email to:", orderToUpdate.buyerEmail);

        emailjs.send(
          'service_iyjjub3',    // 👈 Your Service ID from the screenshot
          'template_u118xbs',   // 👈 Paste your Template ID here
          templateParams,
          'enm9N6mcUVaAeB2C-'     // 👈 Paste your Public Key here
        ).then(() => {
          alert("Status updated & Email sent!");
        }).catch((error) => {
          console.error('❌ Email failed:', error);
          alert("Status updated, but email failed to send.");
        });
      } else {
        alert("Status updated! (No email on file for this guest)");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ... (Keep your existing return JSX for the table here)
  if (loading) return <p style={{ padding: '30px' }}>Loading orders...</p>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Orders ({orders.length})</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {orders.map((order) => (
          <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>{order.customerName} - {order.phone}</p>
              </div>
              <div>
                <select 
                  value={order.status} 
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#666' }}>Ship To: {order.address}</p>
            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Total: ₹{order.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}