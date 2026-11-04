import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../data/firebase'; 

export default function Invoice() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          const docRef = doc(db, 'orders', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.error("No such order!");
          }
        } catch (err) {
          console.error("Error fetching invoice:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading invoice...</div>;
  if (!order) return <div style={{ padding: '50px', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>⚡ ShopNova</h1>
          <p style={{ margin: '5px 0', color: 'gray' }}>123 E-Commerce St, Tech City</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0 }}>INVOICE</h2>
          <p style={{ margin: '5px 0' }}><strong>Order ID:</strong> #{order.id?.slice(-6).toUpperCase()}</p>
          // 1. Fix the Date in the Header
<p style={{ margin: '5px 0' }}>
  <strong>Date:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '10px' }}>Billed To:</h3>
        <p style={{ margin: 0 }}><strong>{user?.displayName || user?.email?.split('@')[0]}</strong></p>
       // 2. Fix the Address in the "Billed To" section
<p style={{ margin: 0, color: 'gray' }}>{order.shippingAddress || order.address || 'Address provided at checkout'}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Item</th>
            <th style={{ padding: '10px' }}>Qty</th>
            <th style={{ padding: '10px' }}>Price</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, index: number) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{item.name}</td>
              <td style={{ padding: '10px' }}>{item.quantity}</td>
              <td style={{ padding: '10px' }}>₹{item.price}</td>
              <td style={{ padding: '10px', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '250px' }}>
          {order.discountApplied > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'green' }}>
              <span>Discount:</span>
              <span>-₹{order.discountApplied}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', borderTop: '2px solid #0f172a', paddingTop: '10px' }}>
            <span>Total:</span>
            <span>₹{Number(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }} className="print-hide">
        <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          🖨️ Print / Save as PDF
        </button>
        <Link to="/profile" style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#0f172a', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          Back to Profile
        </Link>
      </div>

      <p style={{ textAlign: 'center', color: 'gray', marginTop: '40px', fontSize: '12px' }}>
        Thank you for shopping with ShopNova!
      </p>

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
            body { background-color: white; }
            nav { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}