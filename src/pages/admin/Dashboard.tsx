import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
    };
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;

  // --- Calculate Analytics ---
  let totalRevenue = 0;
  let pendingOrders = 0;
  
  orders.forEach(order => {
    if (order.status !== 'Cancelled') {
      totalRevenue += Number(order.total) || 0;
    }
    if (order.status === 'Pending') pendingOrders++;
  });

  // Get 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // --- Calculate Chart Data (Last 7 Days) ---
  const chartData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    
    const dayRevenue = orders.reduce((sum, order) => {
      if (order.status === 'Cancelled') return sum;
      const orderDate = new Date(order.createdAt);
      if (orderDate.toDateString() === d.toDateString()) {
        return sum + (Number(order.total) || 0);
      }
      return sum;
    }, 0);

    chartData.push({ name: dateString, revenue: dayRevenue });
  }

  // ✅ NEW: Build Recent Activity Feed
  // Combine latest orders and latest users, sort by time
  const activities = [
    ...recentOrders.map(o => ({
      id: o.id,
      type: 'order',
      title: `New order from ${o.customerName}`,
      subtitle: `₹${Number(o.total).toFixed(2)}`,
      time: o.createdAt,
      link: '/admin/AdminOrders'
    })),
    ...users.slice(0, 3).map(u => ({
      id: u.id,
      type: 'user',
      title: `New customer registered`,
      subtitle: u.email || 'Unknown',
      time: u.createdAt || new Date(),
      link: '/admin/users'
    }))
  ].sort((a, b) => {
    // Safely compare dates
    const timeA = new Date(a.time).getTime() || 0;
    const timeB = new Date(b.time).getTime() || 0;
    return timeB - timeA;
  }).slice(0, 6); // show top 6 activities


  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Admin Overview</h1>
      <p style={{ margin: '0 0 32px 0', color: '#6b7280' }}>Here is what is happening in your store today.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '5px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Orders</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{orders.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '5px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Orders</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{pendingOrders}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '5px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Products</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{products.length}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Revenue (Last 7 Days)</h2>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <Tooltip formatter={(value: any) => [`₹${Number(value || 0).toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Layout: Recent Orders + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Recent Orders */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Orders</h2>
            <Link to="/admin/AdminOrders" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>View All</Link>
          </div>
          <div style={{ padding: '20px' }}>
            {recentOrders.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentOrders.map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{order.customerName}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>₹{Number(order.total).toFixed(2)}</p>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Pending' ? '#fef9c3' : '#dbeafe',
                      color: order.status === 'Delivered' ? '#166534' : order.status === 'Pending' ? '#854d0e' : '#1e40af'
                    }}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Recent Activity Feed */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Activity</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {activities.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No activity yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {activities.map((act, idx) => (
                  <Link to={act.link} key={idx} style={{ display: 'flex', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: act.type === 'order' ? '#dbeafe' : '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      {act.type === 'order' ? '📦' : '👤'}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 'bold' }}>{act.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{act.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}