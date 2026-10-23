import { useState, useEffect, useMemo } from 'react';
// ⚠️ Double check this path points to your actual firebase file!
import { db } from '../../data/firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  category: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string; // May be optional if not saved in checkout
  address?: string;
  total: number;
  status: OrderStatus;
  createdAt: any;
  items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // 1. Load Data from Firebase in Real-Time
  useEffect(() => {
    console.info('[Orders] Connecting to Firebase...');
    
    // We use onSnapshot so if a customer places an order right now, it pops up on your screen instantly!
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Calculate total if it doesn't exist, by adding up the items
        let calculatedTotal = data.total;
        if (!calculatedTotal && data.items) {
          calculatedTotal = data.items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
        }

        fetchedOrders.push({
          id: docSnap.id,
          customerName: data.customerName || 'Unknown',
          customerEmail: data.customerEmail || data.email || 'No email provided',
          address: data.address || '',
          total: calculatedTotal || 0,
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          items: data.items || []
        });
      });
      setOrders(fetchedOrders);
      setLoading(false);
      console.info(`[Orders] Loaded ${fetchedOrders.length} orders.`);
    }, (err) => {
      console.error('[Orders] Firebase error:', err);
      setError("Failed to load. Check Firestore rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Actions
  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete this order permanently?`)) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order.");
    }
  };

  // 3. Filter
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  // --- Render ---
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading live orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Live Orders</h1>
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Items</th>
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
                <>
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                      {/* Handle Firebase Timestamp or String */}
                      {order.createdAt?.toDate 
                        ? order.createdAt.toDate().toLocaleDateString() 
                        : new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.address}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {order.items?.length || 0} items
                      </button>
                    </td>
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
                  {/* Expanded Items View */}
                  {expandedOrder === order.id && (
                    <tr key={`${order.id}-details`} style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td colSpan={6} style={{ padding: '12px' }}>
                        <strong style={{ fontSize: '12px' }}>Order Items:</strong>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px' }}>
                          {order.items?.map((item, idx) => (
                            <li key={idx}>
                              {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}