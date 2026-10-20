import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function CartPage() {
  const { cart, update, remove } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn-primary">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      <div className="cart-list">
        {cart.items.map((item: any) => {
          // 1. Check if the product data is in 'item.product' or 'item.productId'
          const product = item.product || item.productId;
          
          // 2. Safety check: If the product doesn't exist for some reason, skip it
          if (!product) return null;

          return (
            <div key={product._id} className="cart-item">
              <img 
                src={product.image || 'https://placehold.co/100x100?text=No+Image'} 
                alt={product.name} 
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <div className="cart-item-info">
                <Link to={`/product/${product._id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p>{formatPrice(item.price || product.price)} each</p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => update(product._id, Number(e.target.value))}
                style={{ width: '60px', padding: '5px' }}
              />
              <p className="line-total">
                {formatPrice((item.price || product.price) * item.quantity)}
              </p>
              <button 
                onClick={() => remove(product._id)} 
                className="btn-danger"
                style={{ padding: '8px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      <div className="cart-summary" style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Total: {formatPrice(cart.total)}</h2>
        <Link 
          to="/checkout" 
          className="btn-primary"
          style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px' }}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}