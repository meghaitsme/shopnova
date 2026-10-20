import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import type { Product } from '../../types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Use the Firebase context function we created
    addToCart(product);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <img 
        src={product.image || "https://placehold.co/400x400?text=No+Image"} 
        alt={product.name} 
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
      />
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
      
      <button 
        onClick={handleAddToCart}
        style={{ 
          width: '100%', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '6px', 
          border: 'none', 
          cursor: 'pointer' 
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}