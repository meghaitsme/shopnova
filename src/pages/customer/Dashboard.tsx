import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the 'orders' collection in real-time
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard data...</div>;

  // --- Calculate Analytics ---
  let totalRevenue = 0;
  let pendingOrders = 0;
  let deliveredOrders = 0;

  orders.forEach(order => {
    // Only add to revenue if the order isn't cancelled
    let orderTotal = order.total;
    // If total isn't explicitly saved, calculate it from items
    if (!orderTotal && order.items) {
      orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    }

    if (order.status !== 'Cancelled') {
      totalRevenue += orderTotal;
    }

    if (order.status === 'Pending') pendingOrders++;
    if (order.status === 'Delivered') deliveredOrders++;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard Overview</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Revenue Card */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#14532d' }}>
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Total Orders Card */}
        <div style={{ backgroundColor: '#eff6ff', padding: '24px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Orders</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>
            {orders.length}
          </p>
        </div>

        {/* Pending Orders Card */}
        <div style={{ backgroundColor: '#fefce8', padding: '24px', borderRadius: '12px', border: '1px solid #fef08a' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#854d0e', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Shipments</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#713f12' }}>
            {pendingOrders}
          </p>
        </div>

        {/* Delivered Orders Card */}
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: 'bold', textTransform: 'uppercase' }}>Delivered</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {deliveredOrders}
          </p>
        </div>

      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/admin/orders" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Manage Orders
        </Link>
        <Link to="/admin/products" style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>
          Manage Products
        </Link>
      </div>

    </div>
  );
}