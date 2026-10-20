//admin 
import { useEffect, useState } from 'react';
import { db } from '../../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let totalRevenue = 0;
        const uniqueUsers = new Set();
        
        ordersSnapshot.forEach(doc => {
          const order = doc.data();
          if (order.status !== 'Cancelled') {
            totalRevenue += order.total || 0;
          }
          if (order.userId) uniqueUsers.add(order.userId);
        });

        // 2. Fetch Products
        const productsSnapshot = await getDocs(collection(db, 'products'));

        setStats({
          revenue: totalRevenue,
          orders: ordersSnapshot.size,
          products: productsSnapshot.size,
          users: uniqueUsers.size
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome back! Here is the overview of your store.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Revenue Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #10b981' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            {formatPrice(stats.revenue)}
          </p>
        </div>

        {/* Orders Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Orders</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            {stats.orders}
          </p>
        </div>

        {/* Products Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #f59e0b' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Products</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            {stats.products}
          </p>
        </div>

        {/* Customers Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #8b5cf6' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Customers</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            {stats.users}
          </p>
        </div>

      </div>
    </div>
  );
}