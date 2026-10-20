import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ONLY Fetch from Firebase
        const snapshot = await getDocs(collection(db, 'products'));
        const firebaseProducts = snapshot.docs.map(doc => ({
          _id: doc.id, // Firebase ID (20 characters)
          ...doc.data()
        }));

        setProducts(firebaseProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Shop by category</h1>
      
      <h2>Featured products</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {products.map((product) => (
          // Fixed the Link and inner divs
          <Link 
            to={`/product/${product._id}`} 
            key={product._id} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '200px' }}>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/admin/products">
          <button style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            + Add New Product
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;