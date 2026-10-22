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

  // 🚨 AUTO-FILL SAVED ADDRESS
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

  const totalPrice = cart?.reduce((total: number, item: any) => {
    return total + (item.price * (item.quantity || 1));
  }, 0) || 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log("📦 [Checkout] Placing order...");

    try {
      const orderData = {
        userId: user?.uid || 'guest',
        customerName: name,
        address: `${address}, ${city} - ${pincode}`,
        phone: phone,
        items: cart,
        totalAmount: totalPrice,
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
          <input 
            type="text" placeholder="Full Name" required
            value={name} onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text" placeholder="Full Address" required
            value={address} onChange={(e) => setAddress(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" placeholder="City" required
              value={city} onChange={(e) => setCity(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }}
            />
            <input 
              type="text" placeholder="Pincode / Zip" required
              value={pincode} onChange={(e) => setPincode(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }}
            />
          </div>
          <input 
            type="tel" placeholder="Phone Number" required
            value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <h3 style={{ marginTop: '20px' }}>Payment Method</h3>
          <div style={{ padding: '15px', border: '1px solid #2874f0', borderRadius: '4px', backgroundColor: '#f0f7ff' }}>
            <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
            <strong>Cash on Delivery (COD)</strong>
            <p style={{ margin: '5px 0 0 25px', fontSize: '14px', color: '#666' }}>Pay when your order arrives.</p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            style={{ marginTop: '20px', backgroundColor: '#fb641b', color: 'white', padding: '15px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
          >
            {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(totalPrice)}`}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', borderTop: '1px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}