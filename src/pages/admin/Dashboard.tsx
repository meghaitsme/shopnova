import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    // Fetch all orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
    });

    // Fetch all products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
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

  // Get Low Stock Products (< 10 items)
  const lowStockProducts = products
    .filter(p => (Number(p.stock) || 0) < 10)
    .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
    .slice(0, 5);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Admin Overview</h1>
      <p style={{ margin: '0 0 32px 0', color: '#6b7280' }}>Here is what is happening in your store today.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', borderLeft: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue</p>
          <p style={{ margin: '12px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
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

      {/* Two Column Layout for Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Left Col: Recent Orders */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>View All</Link>
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

        {/* Right Col: Low Stock Alerts */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Low Stock Alerts</h2>
            <Link to="/admin/products" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>Manage Products</Link>
          </div>
          <div style={{ padding: '20px' }}>
            {lowStockProducts.length === 0 ? (
              <p style={{ color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>All products are well stocked!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lowStockProducts.map(product => (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={product.image || product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{product.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>₹{Number(product.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: (Number(product.stock) || 0) === 0 ? '#fee2e2' : '#fef9c3',
                      color: (Number(product.stock) || 0) === 0 ? '#991b1b' : '#854d0e'
                    }}>
                      {product.stock || 0} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}