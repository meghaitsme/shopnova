import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { formatPrice } from '../../utils/format';

export default function PLP() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setProducts(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (sortBy === 'price-asc') result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price));
    return result;
  }, [products, search, category, sortBy]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading products...</div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '30px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>All Products</h1>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '32px', alignItems: 'center' }}>
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: '1 1 200px', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>
            <option value="default">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '20px', color: '#374151' }}>No products found</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => {
              // ✅ NEW: Calculate Discount
              const discountPercent = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '220px', backgroundColor: '#f3f4f6', padding: '16px', position: 'relative' }}>
                      {discountPercent > 0 && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 1 }}>
                          {discountPercent}% OFF
                        </div>
                      )}
                      <img src={(product.image || product.imageUrl || 'https://placehold.co/300x300').split(',')[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{product.category}</p>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', flex: 1 }}>{product.name}</h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatPrice(product.price)}</p>
                        {discountPercent > 0 && (
                          <p style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through', margin: 0 }}>
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}