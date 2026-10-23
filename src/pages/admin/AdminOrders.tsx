import { useState, useEffect, useMemo } from 'react';
import { db } from '../../data/firebase'; 
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, increment } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useToast } from '../../context/ToastContext';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
   productId?: string; // ✅ Added
  _id?: string;       // ✅ Added
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
  phone?: string;       
  couponUsed?: string;  
  subtotal?: number;    
  shippingCost?: number; 
  discountApplied?: number; // ✅ ADD THIS LINE
  total: number;
  status: OrderStatus;
  createdAt: any;
  items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All'); 
  const [error, setError] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

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
          phone: data.phone || '',
          couponUsed: data.couponUsed || '',
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
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

  // 2. Actions (Updated with Restock & Email)
  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      const orderToUpdate = orders.find(o => o.id === id);
      if (!orderToUpdate) return;

      // 1. Update the order status
      await updateDoc(doc(db, 'orders', id), { status: newStatus });

      // 2. If it was just cancelled, restock the items
      if (newStatus === 'Cancelled' && orderToUpdate.status !== 'Cancelled') {
        for (const item of orderToUpdate.items) {
          const productRef = doc(db, 'products', item.productId || (item as any)._id);
          await updateDoc(productRef, {
            stock: increment(item.quantity)
          });
        }
        console.log("Inventory restocked for cancelled order.");
      }

      // 3. Send EmailJS status update
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey && orderToUpdate.customerEmail) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_name: orderToUpdate.customerName,
              to_email: orderToUpdate.customerEmail,
              order_id: id,
              order_status: newStatus
            },
            publicKey
          );
          console.log(`Status update email sent to ${orderToUpdate.customerEmail}`);
        } catch (emailErr) {
          console.error("Failed to send status update email:", emailErr);
        }
      }

    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
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

  // 3. Export to CSV Function
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Address', 'Phone', 'Total (INR)', 'Status', 'Coupon Used'];
    
    const csvRows = orders.map(order => {
      const itemsList = order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(' | ') || '';
      const escape = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

      return [
        escape(order.id),
        escape(new Date(order.createdAt).toLocaleDateString()),
        escape(order.customerName),
        escape(order.customerEmail),
        escape(order.address),
        escape(order.phone),
        escape(Number(order.total).toFixed(2)),
        escape(order.status),
        escape(order.couponUsed || 'None'),
        escape(itemsList)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shopnova_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Filter
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    
    return orders.filter(o => {
      if (statusFilter !== 'All' && o.status !== statusFilter) {
        return false;
      }
      
      if (q) {
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        if (!matchesId && !matchesName) return false;
      }

      return true;
    });
  }, [orders, search, statusFilter]);

  // 5. Calculate Quick Stats
  const stats = useMemo(() => {
    let revenue = 0;
    let pending = 0;
    let delivered = 0;
    
    orders.forEach(o => {
      if (o.status !== 'Cancelled') revenue += o.total;
      if (o.status === 'Pending') pending++;
      if (o.status === 'Delivered') delivered++;
    });

    return { total: orders.length, revenue, pending, delivered };
  }, [orders]);

  // --- Render ---
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading live orders...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>

            {/* CSS for printing the Admin Receipt */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .printable-admin-receipt, .printable-admin-receipt * { visibility: visible; }
            .printable-admin-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Live Orders</h1>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Revenue</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>₹{stats.revenue.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Orders</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{stats.pending}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Delivered</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
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

        <button 
          onClick={handleExportCSV}
          style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📥 Export CSV
        </button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select 
                        value={order.status}
                        disabled={updatingId === order.id}
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
                      {updatingId === order.id && <span style={{ fontSize: '12px', color: '#6b7280' }}>Sending email...</span>}
                    </div>
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

        {/* ✅ HIDDEN ADMIN RECEIPT FOR PRINTING */}
      {selectedOrder && (
        <div className="printable-admin-receipt" style={{ display: 'none' }}>
          <div style={{ fontFamily: 'sans-serif', color: '#000' }}>
            <h1 style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>ShopNova - Order Invoice</h1>
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
            <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
            <p><strong>Phone:</strong> {selectedOrder.phone}</p>
            <p><strong>Shipping To:</strong> {selectedOrder.address}</p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid black' }}>
                  <th style={{ padding: '8px 0' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '8px 0' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ marginTop: '20px', textAlign: 'right', borderTop: '2px solid black', paddingTop: '10px' }}>
             {(selectedOrder.discountApplied || 0) > 0 && <p>Discount: -₹{Number(selectedOrder.discountApplied || 0).toFixed(2)}</p>}
              <h2>Total: ₹{selectedOrder.total.toFixed(2)}</h2>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}