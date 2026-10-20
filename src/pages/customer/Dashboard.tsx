import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Product, Order } from '../../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products').catch(() => ({ data: [] })),
          user ? api.get('/orders/my').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        const prods = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.products || [];
        const ords = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        setProducts(prods);
        setOrders(ords);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Guest'} 👋</h1>
        <p>Here&apos;s what&apos;s happening in your Shopnova store today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><i className="bx bx-package" /></div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{loading ? '—' : products.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><i className="bx bx-cart" /></div>
          <div className="stat-info">
            <span className="stat-label">Cart Items</span>
            <span className="stat-value">{itemCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><i className="bx bx-receipt" /></div>
          <div className="stat-info">
            <span className="stat-label">My Orders</span>
            <span className="stat-value">{loading ? '—' : orders.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><i className="bx bx-dollar-circle" /></div>
          <div className="stat-info">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Products</h2>
            <Link to="/products" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : products.length === 0 ? (
            <p className="muted">No products yet.</p>
          ) : (
            <ul className="mini-list">
              {products.slice(0, 5).map((p) => (
                <li key={p._id}>
                  <Link to={`/product/${p._id}`}>
                    <img src={p.image || 'https://picsum.photos/60'} alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <span>${p.price?.toFixed(2)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <ul className="mini-list">
              {orders.slice(0, 5).map((o) => (
                <li key={o._id}>
                  <div className="order-row">
                    <div>
                      <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`status status-${o.status}`}>{o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
