import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Orders (for Revenue and Order Count)
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let revenue = 0;
        ordersSnap.forEach((doc) => {
          const order = doc.data();
          if (order.status !== 'Cancelled') {
            revenue += order.totalAmount || 0;
          }
        });

        // 2. Fetch Products Count
        const productsSnap = await getDocs(collection(db, 'products'));

        // 3. Fetch Users Count
        const usersSnap = await getDocs(collection(db, 'users'));

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome back! Here is an overview of your store's performance.</p>
      </div>

      {/* 🟢 STATS CARDS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        
        {/* Revenue Card */}
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Revenue</h3>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{formatPrice(stats.totalRevenue)}</h2>
        </div>

        {/* Orders Card */}
        <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Orders</h3>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{stats.totalOrders}</h2>
        </div>

        {/* Products Card */}
        <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Products</h3>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{stats.totalProducts}</h2>
        </div>

        {/* Users Card */}
        <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Registered Users</h3>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{stats.totalUsers}</h2>
        </div>

      </div>

      {/* 🟢 QUICK ACTIONS */}
      <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Quick Actions</h3>
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
        <Link to="/admin/add-product" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          + Add New Product
        </Link>
        <Link to="/admin/products" style={{ backgroundColor: '#475569', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          Manage Products
        </Link>
        <Link to="/admin/orders" style={{ backgroundColor: '#fb641b', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          View Orders
        </Link>
      </div>

    </div>
  );
}