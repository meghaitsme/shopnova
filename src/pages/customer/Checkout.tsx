import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
// 👇 CHANGE THIS IMPORT if your cart context is named differently
import { useCart } from '../../context/CartContext'; 

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart(); // Assuming this is your cart hook
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const finalTotal = cartTotal - discount;

  // --- 1. Apply Coupon Logic ---
  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    setDiscount(0);

    if (!couponCode.trim()) return;

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponError('Invalid coupon code.');
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const couponData = couponDoc.data();

      // Check if expired
      const isExpired = new Date(couponData.expiryDate) < new Date();
      if (isExpired) {
        setCouponError('This coupon has expired.');
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (couponData.discountType === 'percentage') {
        discountAmount = (cartTotal * couponData.discountValue) / 100;
      } else {
        discountAmount = couponData.discountValue;
      }

      // Make sure discount isn't more than the cart total
      if (discountAmount > cartTotal) discountAmount = cartTotal;

      setDiscount(discountAmount);
      setAppliedCoupon(couponData);
    } catch (err) {
      console.error("Error applying coupon:", err);
      setCouponError('Failed to apply coupon.');
    }
  };

  // --- 2. Place Order Logic ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      // Create the order object
      const orderData = {
        customerName: user.displayName || user.email || 'Unknown',
        customerEmail: user.email || 'No email',
        address: address,
        phone: phone,
        items: cart,
        total: finalTotal,
        discountApplied: discount,
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        status: 'Pending',
        createdAt: new Date().toISOString() // Or use serverTimestamp() if preferred
      };

      // Save to Firebase
      await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart
      if (clearCart) clearCart();
      
      setOrderSuccess(true);
      setTimeout(() => navigate('/order-success'), 1500);

    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return <div style={{ padding: '50px', textAlign: 'center', fontSize: '24px', color: 'green' }}>Order Placed Successfully! Redirecting...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Shipping Form */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Shipping Details</h2>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Full Address</label>
            <textarea 
              required 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              rows={3} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
            <input 
              required 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '14px', backgroundColor: loading ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px' }}
          >
            {loading ? 'Processing...' : `Place Order (₹${finalTotal.toFixed(2)})`}
          </button>
        </form>

        {/* Right Side: Order Summary & Coupon */}
        <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981', fontWeight: 'bold' }}>
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* Coupon Input */}
          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Have a coupon?</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter code" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', textTransform: 'uppercase' }}
              />
              <button 
                type="button" 
                onClick={handleApplyCoupon}
                style={{ padding: '8px 16px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
            {couponError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{couponError}</p>}
            {appliedCoupon && <p style={{ color: '#10b981', fontSize: '12px', margin: '4px 0 0 0' }}>Coupon Applied!</p>}
          </div>
        </div>

      </div>
    </div>
  );
}