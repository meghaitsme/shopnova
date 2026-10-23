import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query } from 'firebase/firestore';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  // 1. Fetch Coupons
  useEffect(() => {
    // Note: If your coupons don't have a 'createdAt' field, you might need to remove the orderBy
    const q = query(collection(db, 'coupons')); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Coupon[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          code: data.code || 'UNKNOWN',
          discountType: data.discountType || 'percentage',
          discountValue: Number(data.discountValue) || 0,
          expiryDate: data.expiryDate || '',
        });
      });
      // Sort in memory just in case
      fetched.sort((a, b) => a.code.localeCompare(b.code));
      setCoupons(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      alert("Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      // Convert code to uppercase so "SAVE10" and "save10" are the same
      const formattedCode = code.trim().toUpperCase();

      await addDoc(collection(db, 'coupons'), {
        code: formattedCode,
        discountType,
        discountValue: Number(discountValue),
        expiryDate,
        createdAt: new Date().toISOString()
      });

      // Reset form
      setCode('');
      setDiscountValue('');
      setExpiryDate('');
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding coupon:", err);
      alert("Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Delete Coupon
  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Delete coupon "${codeName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert("Failed to delete coupon.");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading coupons...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Manage Coupons</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>Create and manage discount codes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ padding: '10px 20px', backgroundColor: isAdding ? '#6b7280' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isAdding ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {/* Add Coupon Form */}
      {isAdding && (
        <form onSubmit={handleAddCoupon} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Coupon Code</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. SUMMER50"
              value={code} 
              onChange={e => setCode(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', textTransform: 'uppercase' }} 
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Type</label>
            <select 
              value={discountType} 
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: 'white' }}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Value</label>
            <input 
              required 
              type="number" 
              min="1"
              placeholder={discountType === 'percentage' ? "10" : "500"}
              value={discountValue} 
              onChange={e => setDiscountValue(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Expiry Date</label>
            <input 
              required 
              type="date" 
              value={expiryDate} 
              onChange={e => setExpiryDate(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ padding: '10px 24px', backgroundColor: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', height: '42px' }}
          >
            {saving ? 'Saving...' : 'Save Coupon'}
          </button>
        </form>
      )}

      {/* Coupons Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Code</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Discount</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Expiry Date</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                  No coupons created yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                return (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '16px' }}>
                      {coupon.code}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#10b981' }}>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {coupon.expiryDate}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: isExpired ? '#fee2e2' : '#dcfce7',
                        color: isExpired ? '#991b1b' : '#166534'
                      }}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}