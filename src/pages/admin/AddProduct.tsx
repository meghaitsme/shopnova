import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

export default function AddProduct() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState(''); // ✅ NEW
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !stock) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null, // ✅ NEW
        category: category,
        stock: Number(stock),
        description: description,
        image: imageUrls, 
        createdAt: new Date().toISOString()
      });

      showToast("Product added successfully!", "success");
      navigate('/admin/products');
    } catch (err: any) {
      console.error("Error adding product:", err);
      showToast("Failed to add product.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Add New Product</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Fill in the details below to add a new item to your store.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Product Name *</label>
          <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Mouse" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Selling Price (₹) *</label>
            <input required type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 599" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Original Price (MRP)</label>
            <input type="number" step="0.01" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 999" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Stock Quantity *</label>
            <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 50" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: 'white' }}>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Image URLs (Comma Separated)</label>
          <textarea value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={3} placeholder="https://image1.jpg, https://image2.jpg" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe your product..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" disabled={saving} style={{ flex: '1', padding: '14px', backgroundColor: saving ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} style={{ flex: '1', padding: '14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}