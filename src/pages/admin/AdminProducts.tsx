import { useEffect, useState } from 'react';
import { formatPrice } from '../../utils/format';
import { db } from '../../data/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Track image upload state
  const [form, setForm] = useState({
    name: '', description: '', price: 0, image: '', category: 'Electronics', stock: 0
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const items = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setProducts(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, image: '', category: 'Electronics', stock: 0 });
    setEditing(null);
    setError('');
  };

  // 🚨 NEW: Handle Image Upload via ImgBB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // 1. Create form data
      const formData = new FormData();
      formData.append('image', file);

      // 2. Send to ImgBB API
      // 👇 REPLACE THIS WITH YOUR ACTUAL API KEY 👇
      const apiKey = '5b4a62511b238850dc067806eef80a45'; 
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 3. ImgBB gives you the direct URL here
        const imageUrl = data.data.url;
        setForm((prev) => ({ ...prev, image: imageUrl }));
        console.log("✅ Image uploaded:", imageUrl);
      } else {
        throw new Error(data.error?.message || 'ImgBB upload failed');
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateDoc(doc(db, 'products', editing), form);
      } else {
        await addDoc(collection(db, 'products'), form);
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    }
  };

  const edit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
    });
    setEditing(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { width: '100%', padding: 10, marginBottom: 10, border: '1px solid #d1d5db', borderRadius: 8 };

  return (
    <div className="container">
      <h1>Admin Products</h1>

      <form onSubmit={submit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 32 }}>
        <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>

        <input style={inputStyle} placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} required />

        <input style={inputStyle} type="number" placeholder="Price" value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />

        {/* 🚨 NEW: Image Upload Input */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            style={{ marginBottom: 5 }} 
          />
          {uploading && <p style={{ color: '#2563eb', fontSize: 14 }}>Uploading...</p>}
          
          {/* Show a preview if an image is selected */}
          {form.image && !uploading && (
            <img src={form.image} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />
          )}
        </div>

        <select style={inputStyle} value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Books</option>
        </select>

        <input style={inputStyle} type="number" placeholder="Stock" value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />

        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn-primary" disabled={uploading || !form.image}>
            {uploading ? 'Wait for upload...' : editing ? 'Update Product' : 'Add Product'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm}
              style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Existing Products ({products.length})</h2>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', background: 'white', borderRadius: 12, overflow: 'hidden' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left' }}>Image</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Category</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Price</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Stock</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: 12 }}>
                  <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                </td>
                <td style={{ padding: 12, fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: 12 }}>{p.category}</td>
                <td style={{ padding: 12 }}>{formatPrice(p.price)}</td>
                <td style={{ padding: 12 }}>{p.stock}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => edit(p)}
                    style={{ marginRight: 8, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => del(p._id)}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}