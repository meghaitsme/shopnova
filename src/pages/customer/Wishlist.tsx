import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import {
  getWishlist,
  removeFromWishlist,
  type WishlistProduct,
} from '../../utils/wishlist';

export default function Wishlist() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [message, setMessage] = useState('');
  const { add } = useCart();

  const loadWishlist = () => {
    setProducts(getWishlist());
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    loadWishlist();
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    try {
      await add(product._id, 1);
      setMessage(`${product.name} added to cart.`);
    } catch {
      setMessage('Please log in before adding products to your cart.');
    }
  };

  return (
    <main className="container" style={{ padding: '24px 0' }}>
      <h1>My Wishlist ❤️</h1>
      <p>Products you have saved for later.</p>

      {message && <p role="status">{message}</p>}

      {products.length === 0 ? (
        <div>
          <p>Your wishlist is empty.</p>
          <Link to="/products">Explore Products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              <Link to={`/product/${product._id}`}>
                <div className="product-image">
                  <img
                    src={product.image || ''}
                    alt={product.name}
                  />
                </div>
              </Link>

              <div className="product-body">
                <h3>
                  <Link to={`/product/${product._id}`}>
                    {product.name}
                  </Link>
                </h3>

                <p>{product.category}</p>
                <p className="product-price">
                  {formatPrice(product.price)}
                </p>

                <button
                  className="btn-primary"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => handleRemove(product._id)}
                  style={{ marginTop: '8px' }}
                >
                  Remove from Wishlist
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}