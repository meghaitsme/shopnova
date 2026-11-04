import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const finalTotal = totalPrice - discount > 0 ? totalPrice - discount : 0;

  // Coupon Function connected to MongoDB Backend
  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    try {
      setCouponMessage('Applying...');
      
      // You'll need to pass a real user ID and order ID in production
      const userId = "buyer2026"; 
      const orderId = "order_" + Date.now(); 

      const response = await fetch("http://localhost:5000/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          userId: userId,
          orderId: orderId,
          cartTotal: totalPrice
        })
      });

      const data = await response.json();

      if (data.success) {
        setDiscount(data.discount);
        setCouponMessage(`Coupon applied! ₹${data.discount} off.`);
      } else {
        setDiscount(0);
        // This will display "EXPIRED", "INVALID_CODE", or "MIN_CART_NOT_MET" from your backend
        setCouponMessage(`Error: ${data.message}`); 
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setDiscount(0);
      setCouponMessage('Failed to connect to server.');
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go back to shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Your Shopping Cart</h2>
      
      <div style={{ marginTop: '20px' }}>
        {cart.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
            <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '20px' }} />
            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '5px' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* --- COUPON SECTION --- */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
        <h3>Have a coupon?</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="ENTER CODE" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', flex: 1, maxWidth: '300px' }}
          />
          <button 
            onClick={handleApplyCoupon}
            style={{ backgroundColor: '#334155', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
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

      {/* --- TOTAL SECTION --- */}
      <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
        {discount > 0 && (
          <p style={{ color: 'gray', textDecoration: 'line-through', fontSize: '16px' }}>
            Subtotal: ₹{totalPrice.toFixed(2)}
          </p>
        )}
        <h3>Total: ₹{finalTotal.toFixed(2)}</h3>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={clearCart}
            style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            Clear Cart
          </button>
          <button 
            onClick={() => navigate('/checkout')}
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;