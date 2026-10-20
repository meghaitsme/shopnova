import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';
import { formatPrice } from '../../utils/format';

export default function PDP() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      console.log("🔍 [PDP] Fetching product ID:", id);
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("✅ [PDP] Product found:", docSnap.data());
          setProduct({ _id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          console.log("❌ [PDP] Product not found.");
          setProduct(null);
        }
      } catch (err) {
        console.error("❌ [PDP] Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product);
      alert('Added to cart!');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '20px' }}>Product not found. <Link to="/products">Go back</Link></div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/products" style={{ textDecoration: 'none', color: '#2563eb', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Products
      </Link>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <img 
            src={product.image || "https://placehold.co/400x400?text=No+Image"} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <p style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
            {product.category}
          </p>
          <h2 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>
            {formatPrice(product.price)}
          </h2>
          <p style={{ lineHeight: '1.6', color: '#4b5563' }}>
            {product.description || "No description available for this product."}
          </p>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleAddToCart}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}