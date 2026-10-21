import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../data/firebase'; // Ensure this matches the Firebase config module location

const AddProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);

    try {
      // Send data directly to Firebase Firestore
      await addDoc(collection(db, "products"), {
        name: name,
        price: Number(price),
        createdAt: new Date(),
      });
      
      alert("Product added successfully to Firebase!");
      navigate('/'); 
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add New Product</h1>
      <form onSubmit={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <label>
          Product Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Price:
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;