import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function Cart() {
  const navigate = useNavigate();
  
  // Using your exact CartContext values
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/products" 
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Shopping Cart</h1>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Side: Cart Items */}
          <div style={{ flex: '1 1 600px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {cart.map((item: any, index: number) => {
              const imageUrl = item.image || item.imageUrl || 'https://placehold.co/100x100';
              const itemTotal = Number(item.price) * (item.quantity || 1);

              return (
                <div key={item._id || index} style={{ display: 'flex', gap: '20px', padding: '20px', borderBottom: index !== cart.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'center', flexWrap: 'wrap' }}>
                  
                  {/* Image */}
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Details & Quantity Controls */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: 'bold', fontSize: '18px', display: 'block', marginBottom: '8px' }}>
                      {item.name}
                    </Link>
                    <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontWeight: 'bold' }}>{formatPrice(item.price)}</p>
                    
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                        <button 
                          onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                          style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '4px 12px', borderLeft: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', fontWeight: 'bold' }}>
                          {item.quantity || 1}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                          style={{ padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{formatPrice(itemTotal)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Order Summary */}
          <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
              Price Details
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#4b5563' }}>
              <span>Price ({cart.length} items)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#4b5563' }}>
              <span>Delivery Charges</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>FREE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb', fontWeight: 'bold', fontSize: '20px' }}>
              <span>Total Amount</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', marginTop: '24px', padding: '16px', backgroundColor: '#fb641b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}