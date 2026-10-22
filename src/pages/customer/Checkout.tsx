import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
import { db } from '../../data/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState('');

  // Auto-fill saved address
  useEffect(() => {
    const fetchSavedAddress = async () => {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'users'), where('uid', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          if (data.name) setName(data.name);
          if (data.address) setAddress(data.address);
          if (data.phone) setPhone(data.phone);
        }
      } catch (error) {
        console.error("Error fetching saved address:", error);
      }
    };
    fetchSavedAddress();
  }, [user]);

  // Calculate totals
  const subTotal = cart?.reduce((total: number, item: any) => total + (item.price * (item.quantity || 1)), 0) || 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = (subTotal * appliedCoupon.discount) / 100;
  }
  
  const finalTotal = subTotal - discountAmount;

  // Apply Coupon
  const handleApplyCoupon = async () => {
    setCouponMessage('');
    if (!couponCode) return;

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponMessage('❌ Invalid coupon code.');
        setAppliedCoupon(null);
        return;
      }

      const couponData = snap.docs[0].data();
      
      if (subTotal < couponData.minAmount) {
        setCouponMessage(`❌ Minimum order of ${formatPrice(couponData.minAmount)} required.`);
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(couponData);
      setCouponMessage(`✅ Coupon applied! You saved ${couponData.discount}%`);
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponMessage('❌ Failed to apply coupon.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log("📦 [Checkout] Placing order...");

    try {
      const orderData = {
        userId: user?.uid || 'guest',
        buyerEmail: user?.email || 'guest', // 👈 SAVES EMAIL FOR NOTIFICATIONS
        customerName: name,
        address: `${address}, ${city} - ${pincode}`,
        phone: phone,
        items: cart,
        subTotal: subTotal,
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      console.log("Order Data to save:", orderData);
      
      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("✅ [Checkout] Order saved with ID:", docRef.id);

      if (clearCart) clearCart(); 
      localStorage.removeItem('cart');

      alert(`Order Placed Successfully! Order ID: ${docRef.id}`);
      navigate('/order-success'); 

    } catch (error: any) {
      console.error("❌ [Checkout] Error placing order:", error);
      alert(`Failed to place order: ${error.message}`); 
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      
      {/* LEFT: Shipping Form */}
      <div style={{ flex: '2', minWidth: '300px' }}>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Shipping Address</h2>
        
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="text" placeholder="Full Address" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
            <input type="text" placeholder="Pincode / Zip" required value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
          </div>
          <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <h3 style={{ marginTop: '20px' }}>Payment Method</h3>
          <div style={{ padding: '15px', border: '1px solid #2874f0', borderRadius: '4px', backgroundColor: '#f0f7ff' }}>
            <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
            <strong>Cash on Delivery (COD)</strong>
          </div>

          <button type="submit" disabled={isProcessing} style={{ marginTop: '20px', backgroundColor: '#fb641b', color: 'white', padding: '15px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
            {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
          </button>
        </form>
      </div>

      {/* RIGHT: Order Summary */}
      <div style={{ flex: '1', minWidth: '250px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>Order Summary</h3>
        
        {cart.map((item: any) => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
            <span>{item.name} x {item.quantity || 1}</span>
            <span>{formatPrice(item.price * (item.quantity || 1))}</span>
          </div>
        ))}

        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>Apply Coupon</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: '1', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="button" onClick={handleApplyCoupon} style={{ backgroundColor: '#2874f0', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Apply
            </button>
          </div>
          {couponMessage && <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: couponMessage.includes('✅') ? 'green' : 'red' }}>{couponMessage}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <span>Subtotal</span>
          <span>{formatPrice(subTotal)}</span>
        </div>
        
        {appliedCoupon && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: 'green' }}>
            <span>Discount ({appliedCoupon.discount}%)</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', borderTop: '1px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}