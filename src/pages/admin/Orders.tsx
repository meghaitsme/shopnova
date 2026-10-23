import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const LOG_PREFIX = '[Orders]';
const STORAGE_KEY = 'shopnova_admin_orders';

// --- Initial Mock Data (if storage is empty) ---
const DEFAULT_ORDERS: Order[] = [
  { id: 'ORD-1001', customerName: 'Alice Johnson', customerEmail: 'alice@example.com', total: 114.99, status: 'Delivered', createdAt: new Date().toISOString() },
  { id: 'ORD-1002', customerName: 'Bob Smith', customerEmail: 'bob@example.com', total: 129.00, status: 'Shipped', createdAt: new Date().toISOString() },
  { id: 'ORD-1003', customerName: 'Carol Davis', customerEmail: 'carol@example.com', total: 60.50, status: 'Pending', createdAt: new Date().toISOString() },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 1. Load Data
  useEffect(() => {
    try {
      console.info(`${LOG_PREFIX} Loading orders...`);
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation
        if (Array.isArray(parsed)) {
          setOrders(parsed);
          console.info(`${LOG_PREFIX} Loaded ${parsed.length} orders from storage.`);
        } else {
          throw new Error('Invalid data format in storage');
        }
      } else {
        console.info(`${LOG_PREFIX} No saved orders, loading defaults.`);
        setOrders(DEFAULT_ORDERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error loading orders';
      console.error(`${LOG_PREFIX} Error:`, msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Save Data helper
  const saveOrders = (newOrders: Order[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
      setOrders(newOrders);
      console.info(`${LOG_PREFIX} Saved orders to storage.`);
    } catch (err: unknown) {
      console.error(`${LOG_PREFIX} Failed to save:`, err);
      alert('Failed to save changes.');
    }
  };

  // 3. Actions
  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    console.info(`${LOG_PREFIX} Updating order ${id} to ${newStatus}`);
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(`Delete order ${id}?`)) return;
    console.info(`${LOG_PREFIX} Deleting order ${id}`);
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
  };

  // 4. Filter
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) || 
      o.customerEmail.toLowerCase().includes(q)
    );
  }, [orders, search]);

  // --- Render ---
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders</h1>
        <input 
          type="text" 
          placeholder="Search by ID, Name, or Email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '300px' }}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px' }}>Order ID</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Total</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.customerName}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{order.customerEmail}</td>
                  <td style={{ padding: '12px' }}>${order.total.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        border: '1px solid #ccc',
                        backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Pending' ? '#fef9c3' : '#dbeafe'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}