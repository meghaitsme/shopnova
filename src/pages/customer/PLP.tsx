// 1. Add useSearchParams to the import
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // 👈 ADD THIS
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/firebase';
import ProductCard from '../../components/product/ProductCard';
import type { Product } from '../../types';

export default function PLP() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Read the category from the URL
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory); // 👈 Set initial state

  // 3. Add a useEffect to update the dropdown if the URL changes
  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ... (Rest of your filtering logic and JSX remains the same)

  // 🚨 Filter Logic
  const filteredProducts = products.filter((product) => {
    // 1. Search Filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category Filter
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh', padding: '20px' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 🚨 SEARCH AND FILTER BAR */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px 20px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <input 
            type="text" 
            placeholder="Search for products, brands and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: '1', 
              minWidth: '250px',
              padding: '12px 20px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '15px',
              outline: 'none'
            }}
          />

          {/* Category Dropdown */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '12px 20px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '15px',
              cursor: 'pointer',
              backgroundColor: 'white',
              outline: 'none'
            }}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
          </select>
        </div>

        {/* 🚨 PRODUCT GRID */}
        <h2 style={{ margin: '20px 0', color: '#212121' }}>
          {selectedCategory === 'All' ? 'All Products' : selectedCategory} 
          {searchTerm && ` matching "${searchTerm}"`} 
          ({filteredProducts.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '50px', textAlign: 'center', borderRadius: '8px' }}>
            <h3 style={{ color: '#666' }}>No products found</h3>
            <p style={{ color: '#999' }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}