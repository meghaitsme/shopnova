import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("🔍 [Admin] Fetching products...");
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(data);
    } catch (error) {
      console.error("❌ [Admin] Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}"?`);
    if (!confirmDelete) return;

    try {
      console.log(`🗑️ Deleting product: ${productId}`);
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId)); // Update UI instantly
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading products...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Products ({products.length})</h2>
        <Link to="/admin/add-product" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '15px' }}>Image</th>
                <th style={{ padding: '15px' }}>Product Name</th>
                <th style={{ padding: '15px' }}>Category</th>
                <th style={{ padding: '15px' }}>Price</th>
                <th style={{ padding: '15px' }}>Stock</th>
                <th style={{ padding: '15px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <img 
                      src={product.image || "https://placehold.co/50x50?text=No+Image"} 
                      alt={product.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{product.name}</td>
                  <td style={{ padding: '15px' }}>{product.category}</td>
                  <td style={{ padding: '15px', color: '#2874f0', fontWeight: 'bold' }}>{formatPrice(product.price)}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      backgroundColor: product.stock > 0 ? '#d1fae5' : '#fee2e2',
                      color: product.stock > 0 ? '#065f46' : '#991b1b'
                    }}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => handleDelete(product.id, product.name)}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}