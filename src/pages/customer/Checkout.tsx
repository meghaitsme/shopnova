import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; 
import { useToast } from '../../context/ToastContext';
import emailjs from '@emailjs/browser'; // 👈 Import EmailJS

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, totalPrice: cartTotal } = useCart(); 
  const { showToast } = useToast();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 50;
  
  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalTotal = cartTotal + shippingCost - discount;

  // 1. Fetch Available Coupons
  useEffect(() => {
    async function fetchCoupons() {
      try {
        const querySnapshot = await getDocs(collection(db, 'coupons'));
        const validCoupons: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (new Date(data.expiryDate) >= new Date()) {
            validCoupons.push(data);
          }
        });
        setAvailableCoupons(validCoupons);
      } catch (err) {
        console.error("Failed to load available coupons:", err);
      }
    }
    fetchCoupons();
  }, []);

  // 2. Apply Coupon Logic
  const handleApplyCoupon = async (codeToApply?: string) => {
    setCouponError('');
    setAppliedCoupon(null);
    setDiscount(0);

    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', code.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponError('Invalid coupon code.');
        return;
      }

      const couponData = querySnapshot.docs[0].data();

      if (new Date(couponData.expiryDate) < new Date()) {
        setCouponError('This coupon has expired.');
        return;
      }

      let discountAmount = 0;
      if (couponData.discountType === 'percentage') {
        discountAmount = (cartTotal * couponData.discountValue) / 100;
      } else {
        discountAmount = couponData.discountValue;
      }

      if (discountAmount > cartTotal) discountAmount = cartTotal;

      setDiscount(discountAmount);
      setAppliedCoupon(couponData);
      setCouponCode(couponData.code);
      showToast("Coupon applied successfully!", "success");
    } catch (err) {
      console.error("Error applying coupon:", err);
      setCouponError('Failed to apply coupon.');
    }
  };

  // 3. Place Order & Send Email
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login first.", "error");
      return;
    }
    if (!cart || cart.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: user.displayName || user.email || 'Unknown',
        customerEmail: user.email || 'No email',
        address: address,
        phone: phone,
        items: cart,
        subtotal: cartTotal,
        shippingCost: shippingCost,
        discountApplied: discount,
        total: finalTotal,
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // ✅ 1. Save order to Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // ✅ 2. Send confirmation email via EmailJS
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_name: user.displayName || 'Customer',
              to_email: user.email,
              order_id: docRef.id,
              order_total: finalTotal.toFixed(2),
              order_status: 'Pending'
            },
            publicKey
          );
          console.log("Confirmation email sent successfully!");
        }
      } catch (emailErr) {
        // We don't fail the order if the email fails
        console.error("Failed to send confirmation email:", emailErr);
      }
      
      if (clearCart) clearCart();
      
      setOrderSuccess(true);
      showToast("Order placed successfully!", "success");
      setTimeout(() => navigate('/order-success'), 1500);

    } catch (err) {
      console.error("Error placing order:", err);
      showToast("Failed to place order. Please try again.", "error");
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
            <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '14px', backgroundColor: loading ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
            <span>Shipping</span>
            <span style={{ color: shippingCost === 0 ? '#10b981' : '#4b5563', fontWeight: shippingCost === 0 ? 'bold' : 'normal' }}>
              {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
            </span>
          </div>
          {shippingCost > 0 && (
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '-4px 0 8px 0' }}>
              Add ₹{(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more for FREE shipping!
            </p>
          )}

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
              <button type="button" onClick={() => handleApplyCoupon()} style={{ padding: '8px 16px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Apply
              </button>
            </div>
            {couponError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{couponError}</p>}
            {appliedCoupon && <p style={{ color: '#10b981', fontSize: '12px', margin: '4px 0 0 0' }}>Coupon Applied!</p>}
          </div>

          {/* Available Coupons Section */}
          {availableCoupons.length > 0 && !appliedCoupon && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #ccc' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>Available Offers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableCoupons.map((coupon, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleApplyCoupon(coupon.code)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                        {coupon.code}
                      </span>
                      <span style={{ fontSize: '13px', color: '#374151' }}>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>Apply</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}