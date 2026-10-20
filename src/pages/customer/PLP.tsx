import { createElement, useEffect, useState } from 'react';
import type { Product } from '../../types';
import ProductCard from '../../components/product/ProductCard';
import api from '../../api/axios';
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
      try {
        // 1. Fetch from MongoDB with search/category params
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const { data } = await api.get(`/products?${params.toString()}`);
        const mongoProducts = data.items || [];

        // 2. Fetch from Firebase (fetch all, then filter in JS)
        const snapshot = await getDocs(collection(db, 'products'));
        const firebaseProducts = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        })) as Product[];

        // Filter Firebase products based on search/category
        const filteredFirebase = firebaseProducts.filter(p => {
          const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
          const matchCategory = category ? p.category === category : true;
          return matchSearch && matchCategory;
        });

        // 3. Combine and display
        setProducts([...mongoProducts, ...filteredFirebase]);
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // 300ms delay for typing
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