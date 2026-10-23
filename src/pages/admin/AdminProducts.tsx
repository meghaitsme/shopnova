import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  image?: string;
  stock?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quick Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // 1. Fetch Products from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          name: data.name || data.title || 'Unnamed Product',
          price: Number(data.price) || 0,
          category: data.category || 'Uncategorized',
          imageUrl: data.imageUrl || data.image || '',
          stock: Number(data.stock) || 0,
        });
      });
      setProducts(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Delete Product
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  // 3. Quick Edit Handlers
  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock || 0));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrice('');
    setEditStock('');
  };

  const saveQuickEdit = async (id: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'products', id), {
        price: Number(editPrice),
        stock: Number(editStock)
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Filter Search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Manage Products ({products.length})</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #ccc', borderRadius: '6px', width: '250px' }}
          />
          <Link 
            to="/admin/add-product" 
            style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Image</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Product Name</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Price</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>Stock</th>
              <th style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isEditing = editingId === product.id;

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: isEditing ? '#f0fdf4' : 'white' }}>
                    <td style={{ padding: '16px' }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af' }}>No Img</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>
                      {product.name}
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>{product.category}</div>
                    </td>
                    
                    {/* Price Column */}
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editPrice} 
                          onChange={(e) => setEditPrice(e.target.value)} 
                          style={{ width: '80px', padding: '6px', border: '1px solid #10b981', borderRadius: '4px' }} 
                        />
                      ) : (
                        `₹${product.price.toFixed(2)}`
                      )}
                    </td>

                    {/* Stock Column */}
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editStock} 
                          onChange={(e) => setEditStock(e.target.value)} 
                          style={{ width: '80px', padding: '6px', border: '1px solid #10b981', borderRadius: '4px' }} 
                        />
                      ) : (
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: product.stock && product.stock > 0 ? '#dcfce7' : '#fee2e2',
                          color: product.stock && product.stock > 0 ? '#166534' : '#991b1b'
                        }}>
                          {product.stock || 0} in stock
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => saveQuickEdit(product.id)}
                              disabled={saving}
                              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              {saving ? '...' : 'Save'}
                            </button>
                            <button 
                              onClick={cancelEditing}
                              style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(product)}
                              style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Quick Edit
                            </button>
                            <Link 
                              to={`/admin/edit-product/${product.id}`}
                              style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-block' }}
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => handleDelete(product.id, product.name)}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Delete
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}