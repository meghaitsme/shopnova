import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calculate total price safely
  const totalPrice = cart?.reduce((total: number, item: any) => {
    return total + (item.price * (item.quantity || 1));
  }, 0) || 0;

  console.log("🛒 [Cart Page] Items:", cart, "| Total Price:", totalPrice);

  if (!cart || cart.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" style={{ backgroundColor: '#2874f0', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      
      {/* LEFT SIDE: Cart Items */}
      <div style={{ flex: '2', minWidth: '300px' }}>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Shopping Cart</h2>
        
        {cart.map((item: any) => (
          <div key={item._id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', padding: '20px 0' }}>
            <img 
              src={item.image || "https://placehold.co/100x100?text=No+Image"} 
              alt={item.name} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} 
            />
            
            <div style={{ flex: '1' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{item.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>{item.category}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>
                  {formatPrice(item.price)}
                </span>
                
                <button 
                  onClick={() => removeFromCart(item._id)}
                  style={{ backgroundColor: 'transparent', color: 'red', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE: Order Summary */}
      <div style={{ flex: '1', minWidth: '250px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>Price Details</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
          <span>Price ({cart.length} items)</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', color: 'green' }}>
          <span>Delivery Charges</span>
          <span>FREE</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', borderTop: '1px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total Amount</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        <button 
          onClick={() => navigate('/checkout')}
          style={{ width: '100%', backgroundColor: '#fb641b', color: 'white', padding: '15px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}