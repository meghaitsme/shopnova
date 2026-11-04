import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minAmount, setMinAmount] = useState('');

  // 1. Fetch all coupons on load
  const fetchCoupons = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      const fetched: any[] = [];
      snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setCoupons(fetched);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 2. Create a new coupon
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Check if code already exists
      const existing = coupons.find(c => c.code === code.toUpperCase());
      if (existing) {
        showToast("A coupon with this code already exists!", "error");
        setIsCreating(false);
        return;
      }

      await addDoc(collection(db, 'coupons'), {
        code: code.toUpperCase(),
        discount: Number(discount),
        minAmount: Number(minAmount),
        createdAt: new Date()
      });

      showToast("Coupon created successfully!", "success");
      setCode('');
      setDiscount('');
      setMinAmount('');
      fetchCoupons(); // Refresh the list
    } catch (error) {
      console.error("Error creating coupon:", error);
      showToast("Failed to create coupon.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Delete a coupon
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      showToast("Coupon deleted.", "success");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showToast("Failed to delete coupon.", "error");
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>Manage Coupons</h1>

      {/* CREATE COUPON FORM */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Create New Coupon</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Coupon Code</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              placeholder="e.g. WINTER20" 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', textTransform: 'uppercase' }} 
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Discount (₹)</label>
            <input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(e.target.value)} 
              placeholder="e.g. 50" 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Min Cart (₹)</label>
            <input 
              type="number" 
              value={minAmount} 
              onChange={(e) => setMinAmount(e.target.value)} 
              placeholder="e.g. 100" 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isCreating}
            style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isCreating ? 'not-allowed' : 'pointer', height: '42px' }}
          >
            {isCreating ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      </div>

      {/* LIST OF COUPONS */}
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Active Coupons</h2>
      {loading ? (
        <p>Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No coupons found. Create one above!</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>Code</th>
                <th style={{ padding: '16px' }}>Discount</th>
                <th style={{ padding: '16px' }}>Min Cart</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#16a34a', fontWeight: 'bold' }}>₹{c.discount} OFF</td>
                  <td style={{ padding: '16px' }}>₹{c.minAmount}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}