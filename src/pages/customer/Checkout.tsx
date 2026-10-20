import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/firebase';
// 🚨 ONLY import what we use
import { collection, addDoc } from 'firebase/firestore'; 
import { formatPrice } from '../../utils/format';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0 || !user) return;

    setLoading(true);
    try {
      // 1. Create the order object
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.items,
        total: cart.total,
        shippingAddress: { address, city, postalCode },
        status: 'Processing',
        createdAt: new Date().toISOString(),
      };

      // 2. Save to Firebase 'orders' collection
      console.log("💾 [Checkout] Saving order to Firebase...", orderData);
      await addDoc(collection(db, 'orders'), orderData);

      // 3. Clear the cart
      if (clearCart) {
        await clearCart();
      }

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('❌ [Checkout] Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '20px' }}>
      <h1>Checkout</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Order Summary</h3>
        {cart.items.map((item: any) => (
          <div key={item.product._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{item.quantity} x {item.product.name}</span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <hr />
        <h3 style={{ textAlign: 'right' }}>Total: {formatPrice(cart.total)}</h3>
      </div>

      <form onSubmit={placeOrder} style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3>Shipping Address</h3>
        <input 
          type="text" placeholder="Address" required 
          value={address} onChange={(e) => setAddress(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
        />
        <input 
          type="text" placeholder="City" required 
          value={city} onChange={(e) => setCity(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
        />
        <input 
          type="text" placeholder="Postal Code" required 
          value={postalCode} onChange={(e) => setPostalCode(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }} 
        />
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Processing...' : `Place Order (${formatPrice(cart.total)})`}
        </button>
      </form>
    </div>
  );
}