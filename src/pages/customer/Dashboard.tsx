import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend // ✅ NEW: Imports for Pie Chart
} from 'recharts';

// ✅ Colors for the Pie Chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

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

  // Calculate Top Selling Products
  const productSales: Record<string, { name: string, count: number }> = {};
  orders.forEach(order => {
    if (order.status !== 'Cancelled' && order.items) {
      order.items.forEach((item: any) => {
        const name = item.name;
        if (!productSales[name]) productSales[name] = { name, count: 0 };
        productSales[name].count += item.quantity;
      });
    }
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);
  const maxProductCount = topProducts.length > 0 ? topProducts[0].count : 1;

  // --- Calculate Revenue per Category (✅ NEW) ---
  const categoryRevenue: Record<string, number> = {};
  orders.forEach(order => {
    if (order.status !== 'Cancelled' && order.items) {
      order.items.forEach((item: any) => {
        // Find the product in the products list to get its category
        const prodData = products.find(p => p.id === (item.productId || item._id));
        const cat = prodData?.category || 'Other';
        
        const itemTotal = Number(item.price) * Number(item.quantity);
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + itemTotal;
      });
    }
  });

  const pieData = Object.keys(categoryRevenue).map(cat => ({
    name: cat,
    value: Number(categoryRevenue[cat].toFixed(2))
  })).sort((a, b) => b.value - a.value);

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

  // Build Recent Activity Feed
  const activities = [
    ...recentOrders.map(o => ({
      id: o.id, type: 'order', title: `New order from ${o.customerName}`,
      subtitle: `₹${Number(o.total).toFixed(2)}`, time: o.createdAt, link: '/admin/orders'
    })),
    ...users.slice(0, 3).map(u => ({
      id: u.id, type: 'user', title: `New customer registered`,
      subtitle: u.email || 'Unknown', time: u.createdAt || new Date(), link: '/admin/users'
    }))
  ].sort((a, b) => (new Date(b.time).getTime() || 0) - (new Date(a.time).getTime() || 0)).slice(0, 6);


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

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Revenue Line Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Revenue (Last 7 Days)</h2>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* ✅ NEW: Category Pie Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Revenue by Category</h2>
          <div style={{ width: '100%', height: '280px' }}>
            {pieData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '100px' }}>No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${Number(value).toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Layout: Top Products + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Top Selling Products */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Top Selling Products</h2>
            <Link to="/admin/products" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>View All</Link>
          </div>
          <div style={{ padding: '20px' }}>
            {topProducts.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No sales yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {topProducts.map((prod, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 'bold', color: '#374151' }}>{index + 1}. {prod.name}</span>
                      <span style={{ color: '#6b7280', fontWeight: 'bold' }}>{prod.count} sold</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${(prod.count / maxProductCount) * 100}%`, backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#9ca3af', height: '100%', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
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
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: act.type === 'order' ? '#dbeafe' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
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