import { useState, useEffect, useMemo } from 'react';
import { db } from '../../data/firebase'; 
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  category?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
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
  const [statusFilter, setStatusFilter] = useState<string>('All'); // New Status Filter State
  const [error, setError] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Load Data
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        let calculatedTotal = data.total;
        if (!calculatedTotal && data.items) {
          calculatedTotal = data.items.reduce((sum: number, item: OrderItem) => sum + (Number(item.price) * Number(item.quantity)), 0);
        }

        fetchedOrders.push({
          id: docSnap.id,
          customerName: data.customerName || data.name || 'Unknown',
          customerEmail: data.customerEmail || data.email || 'No email provided',
          address: data.address || 'No address provided',
          total: calculatedTotal || 0,
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          items: data.items || []
        });
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error('[Orders] Firebase error:', err);
      setError("Failed to load orders.");
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

  // 3. Filter (Updated to handle both Search AND Status Dropdown)
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    
    return orders.filter(o => {
      // Check Status Filter
      if (statusFilter !== 'All' && o.status !== statusFilter) {
        return false;
      }
      
      // Check Search Text
      if (q) {
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        if (!matchesId && !matchesName) return false;
      }

      return true;
    });
  }, [orders, search, statusFilter]);

  // --- Render ---
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading live orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Live Orders</h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Total</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {order.createdAt?.toDate 
                      ? order.createdAt.toDate().toLocaleDateString() 
                      : new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.address}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{order.total.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      style={{ 
                        padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc',
                        backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Pending' ? '#fef9c3' : order.status === 'Shipped' ? '#dbeafe' : '#fee2e2'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
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

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Order Details</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Customer</h3>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedOrder.customerName}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563' }}>{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Shipping Address</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>{selectedOrder.address || 'No address provided'}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Order Items</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{item.name}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Amount</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}