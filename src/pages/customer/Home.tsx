import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, limit, query, onSnapshot, addDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Newsletter State
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(4));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setFeaturedProducts(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: new Date().toISOString()
      });
      showToast("Successfully subscribed to our newsletter!", "success");
      setEmail('');
    } catch (err) {
      console.error("Error subscribing:", err);
      showToast("Failed to subscribe. Please try again.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* HERO SECTION */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
        color: 'white', 
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2' }}>
            Welcome to ShopNova
          </h1>
          <p style={{ fontSize: '20px', margin: '0 0 32px 0', opacity: 0.9 }}>
            Discover the best products at unbeatable prices. Shop the latest trends today.
          </p>
          <Link 
            to="/products" 
            style={{ 
              display: 'inline-block',
              padding: '16px 32px', 
              backgroundColor: 'white', 
              color: '#1e3a8a', 
              textDecoration: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Shop All Products
          </Link>
        </div>
      </div>

      {/* CATEGORY QUICK LINKS */}
      <div style={{ maxWidth: '1200px', margin: '-30px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {['Electronics', 'Clothing', 'Books', 'Home'].map((cat) => (
            <Link key={cat} to={`/products?category=${cat}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '8px', 
                textAlign: 'center', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '18px',
                transition: 'transform 0.2s'
              }}>
                {cat}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Featured Products</h2>
          <Link to="/products" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <p>Loading featured products...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid #e5e7eb',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ height: '200px', backgroundColor: '#f3f4f6', padding: '16px' }}>
                    <img 
                      src={product.image || product.imageUrl || 'https://placehold.co/300x300'} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', flex: 1 }}>{product.name}</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{formatPrice(product.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ✅ NEW: NEWSLETTER SECTION */}
      <div style={{ backgroundColor: '#111827', padding: '60px 20px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Join our Newsletter</h2>
          <p style={{ color: '#9ca3af', margin: '0 0 24px 0' }}>Get the latest updates on new products and upcoming sales.</p>
          
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ flex: '1 1 300px', padding: '12px 16px', borderRadius: '6px', border: 'none', fontSize: '16px' }}
            />
            <button 
              type="submit" 
              disabled={subscribing}
              style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: subscribing ? 'not-allowed' : 'pointer' }}
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}