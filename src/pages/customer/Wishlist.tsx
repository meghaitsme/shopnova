import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

const WISHLIST_STORAGE_KEY = 'wishlist';

// Helper to get items
function getWishlist(): any[] {
  try {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const items = storedWishlist ? JSON.parse(storedWishlist) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

// Helper to remove items
function removeFromWishlist(productId: string): void {
  const updatedWishlist = getWishlist().filter(
    (product) => product._id !== productId,
  );
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const { addToCart } = useCart(); // ✅ Correct function name

  useEffect(() => {
    setWishlistItems(getWishlist());
  }, []);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    setWishlistItems(getWishlist()); 
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>My Wishlist ({wishlistItems.length})</h2>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>Your wishlist is empty.</p>
          <Link to="/products" style={{ color: '#2874f0', fontWeight: 'bold', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px' 
        }}>
          {wishlistItems.map((product) => (
            <div key={product._id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img 
                src={product.image || "https://placehold.co/300x300?text=No+Image"} 
                alt={product.name} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{product.name}</h3>
                <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#2563eb' }}>
                  {formatPrice(product.price)}
                </p>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    style={{ flex: '1', backgroundColor: '#ff9f00', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleRemove(product._id)}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}