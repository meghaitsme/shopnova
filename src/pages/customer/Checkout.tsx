import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/firebase'; // Make sure this path is correct
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate prices
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 50; // Fixed shipping cost
  const finalTotal = (subtotal + shipping) - discount > 0 ? (subtotal + shipping) - discount : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode || !user) return;
    
    try {
      const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const couponData = querySnapshot.docs[0].data();
        const discountAmount = couponData.discount;
        const minAmount = couponData.minAmount;

        // 👈 CHECK IF ALREADY USED
        const qOrders = query(
          collection(db, "orders"), 
          where("userId", "==", user.uid),
          where("couponUsed", "==", couponCode.toUpperCase())
        );
        const pastOrders = await getDocs(qOrders);

        if (!pastOrders.empty) {
          setDiscount(0);
          setCouponMessage("You have already used this coupon.");
          return; // Stop right here
        }

        // Check minimum amount
        if (subtotal >= minAmount) {
          setDiscount(discountAmount);
          setCouponMessage(`Coupon applied! ₹${discountAmount} off.`);
        } else {
          setDiscount(0);
          setCouponMessage(`Add items worth ₹${minAmount - subtotal} more to use this coupon.`);
        }
      } else {
        setDiscount(0);
        setCouponMessage('Invalid coupon code.');
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponMessage('Error applying coupon.');
    }
  };

  // --- PLACE ORDER LOGIC ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first!");
      navigate('/login');
      return;
    }

    if (cart.length === 0) return;

    setIsProcessing(true);

    try {
           const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        discountApplied: discount,
        couponUsed: discount > 0 ? couponCode.toUpperCase() : null, // 👈 SAVE IT HERE
        totalAmount: finalTotal,
        shippingAddress: address,
        phoneNumber: phone,
        status: "Pending",
        createdAt: new Date()
      };

      await addDoc(collection(db, "orders"), orderData);

      alert("Order placed successfully!");
      clearCart(); 
      navigate('/'); 
      
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>Go Shopping</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      {/* LEFT SIDE: Shipping Details */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>Checkout</h2>
        <h3>Shipping Details</h3>
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Full Address:</label>
            <textarea 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              placeholder="Enter your full shipping address"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number:</label>
            <input 
              type="text" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              placeholder="Enter your phone number"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isProcessing}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}
          >
            {isProcessing ? "Processing..." : `Place Order (₹${finalTotal.toFixed(2)})`}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: Order Summary & Coupon */}
      <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        <h3>Order Summary</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'green' }}>
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* Coupon Section */}
<div style={{ marginTop: '30px' }}>
  <h4 style={{ marginBottom: '10px' }}>Have a coupon?</h4>
  <div style={{ display: 'flex', gap: '10px' }}>
    <input 
      type="text" 
      placeholder="ENTER CODE" 
      value={couponCode} 
      onChange={(e) => setCouponCode(e.target.value)} 
      style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
    />
    <button 
      type="button"  // 👈 This must be type="button" so it doesn't submit the form
      onClick={handleApplyCoupon} // 👈 This must call the function
      style={{ backgroundColor: '#334155', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
    >
      Apply
    </button>
  </div>
  {couponMessage && (
    <p style={{ color: discount > 0 ? 'green' : 'red', marginTop: '10px', fontSize: '14px' }}>
      {couponMessage}
    </p>
  )}
</div>
      </div>

    </div>
  );
};

export default Checkout;