import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Orders (Real-time)
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
      setLoading(false);
    });

    // 2. Fetch Products Count
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProductsCount(snapshot.size);
    });

    // 3. Fetch Customers (Users) Count
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setCustomersCount(snapshot.size);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
    };
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>Loading dashboard data...</div>;
  }

  // --- Calculate Revenue ---
  let totalRevenue = 0;
  orders.forEach(order => {
    let orderTotal = order.total;
    // If total isn't explicitly saved, calculate it from items
    if (!orderTotal && order.items && Array.isArray(order.items)) {
      orderTotal = order.items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
    }
    // Only add to revenue if the order isn't cancelled
    if (order.status !== 'Cancelled' && orderTotal) {
      totalRevenue += orderTotal;
    }
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#111827' }}>Admin Dashboard</h1>
      <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: '16px' }}>Welcome back! Here is the overview of your store.</p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Total Revenue */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '6px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '6px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
            {orders.length}
          </p>
        </div>

        {/* Total Products */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '6px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
            {productsCount}
          </p>
        </div>

        {/* Total Customers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '6px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Customers</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
            {customersCount}
          </p>
        </div>

      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/admin/orders" style={{ padding: '12px 24px', backgroundColor: '#111827', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Manage Orders
        </Link>
        <Link to="/admin/products" style={{ padding: '12px 24px', backgroundColor: 'white', color: '#374151', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>
          Manage Products
        </Link>
      </div>

    </div>
  );
}