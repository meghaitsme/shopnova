import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

function AdminCoupons() { // 👈 Removed 'export default' from here
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), {
        code: code.toUpperCase(),
        discount: Number(discount),
        minAmount: Number(minAmount) || 0,
      });
      alert("Coupon created successfully!");
      setCode('');
      setDiscount('');
      setMinAmount('');
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Failed to create coupon.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manage Coupons</h1>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Create New Coupon</h3>
        <form onSubmit={handleCreateCoupon} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          <input type="text" placeholder="Code (e.g. SAVE10)" value={code} onChange={(e) => setCode(e.target.value)} required style={{ padding: '10px', flex: '1', minWidth: '150px' }} />
          <input type="number" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} required style={{ padding: '10px', flex: '1', minWidth: '100px' }} />
          <input type="number" placeholder="Min Order (₹)" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} style={{ padding: '10px', flex: '1', minWidth: '100px' }} />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create</button>
        </form>
      </div>

      <h3>Active Coupons</h3>
      {loading ? <p>Loading...</p> : coupons.length === 0 ? <p>No coupons created yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {coupons.map((coupon) => (
            <div key={coupon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div>
                <strong style={{ fontSize: '18px', color: '#2874f0' }}>{coupon.code}</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{coupon.discount}% off (Min order: ₹{coupon.minAmount})</p>
              </div>
              <button onClick={() => handleDelete(coupon.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCoupons; // 👈 Added at the very bottom