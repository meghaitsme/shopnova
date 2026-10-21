import { createElement, useEffect, useState } from 'react';
import type { Product } from '../../types';
import ProductCard from '../../components/product/ProductCard';
import api from '../../api/axios'; // We will keep this for Railway later
import { db } from '../../data/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function PLP() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      console.log("🔍 [PLP] Starting fetch process...");
      
      let firebaseProducts: Product[] = [];
      let railwayProducts: Product[] = [];

      // 1. Fetch from Firebase (Priority 1 for User)
      try {
        console.log("🔥 [PLP] Fetching from Firebase...");
        const snapshot = await getDocs(collection(db, 'products'));
        firebaseProducts = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        })) as Product[];
        console.log(`✅ [PLP] Firebase returned ${firebaseProducts.length} products.`);
      } catch (err) {
        console.error('❌ [PLP] Firebase fetch failed:', err);
      }

      // 2. Fetch from Railway (MongoDB) - wrapped in its own try/catch so it doesn't break the page
      try {
        console.log("🚂 [PLP] Attempting to fetch from Railway backend...");
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        // Note: This will only work if VITE_API_URL is set correctly in Vercel
        const { data } = await api.get(`/products?${params.toString()}`);
        railwayProducts = data.items || [];
        console.log(`✅ [PLP] Railway returned ${railwayProducts.length} products.`);
      } catch (err) {
        console.warn('⚠️ [PLP] Railway backend failed or is offline. Relying on Firebase only.', err);
      }

      // 3. Combine and display
      let allProducts = [...firebaseProducts, ...railwayProducts];

      // Filter locally (since Firebase doesn't do text search easily)
      if (search || category) {
        allProducts = allProducts.filter(p => {
          const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
          const matchCategory = category ? p.category === category : true;
          return matchSearch && matchCategory;
        });
      }

      console.log(`📦 [PLP] Total products to display: ${allProducts.length}`);
      setProducts(allProducts);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="container">
      <h1>Products</h1>
      <div className="filters">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => createElement(ProductCard, { key: p._id, product: p }))}
        </div>
      )}
    </div>
  );
}