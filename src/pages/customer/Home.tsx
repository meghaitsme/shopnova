import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/firebase';
import ProductCard from '../../components/product/ProductCard';
import type { Product } from '../../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("🔍 [Home] Fetching products from Firebase...");
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("❌ [Home] Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh' }}>
      
      {/* 🟢 HERO BANNER (Flipkart Style) */}
      <div style={{ backgroundColor: '#2874f0', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', margin: '0 0 15px 0', fontWeight: 'bold' }}>Welcome to ShopNova</h1>
        <p style={{ fontSize: '18px', marginBottom: '25px', opacity: 0.9 }}>Discover the best products at unbeatable prices.</p>
        <Link to="/products" style={{ backgroundColor: '#fb641b', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold' }}>
          Shop Now
        </Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 🟢 CATEGORY SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: 'white', padding: '20px', marginTop: '-20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Link to="/products?category=Electronics" style={{ textDecoration: 'none', color: '#333', textAlign: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '5px' }}>📱</div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Electronics</span>
          </Link>
          <Link to="/products?category=Clothing" style={{ textDecoration: 'none', color: '#333', textAlign: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '5px' }}>👕</div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Clothing</span>
          </Link>
          <Link to="/products?category=Books" style={{ textDecoration: 'none', color: '#333', textAlign: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '5px' }}>📚</div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Books</span>
          </Link>
        </div>

        {/* 🟢 FEATURED PRODUCTS GRID */}
        <div style={{ marginTop: '30px', paddingBottom: '50px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#333' }}>Featured Products</h2>
          
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>No products found in the database yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}