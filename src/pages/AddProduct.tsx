import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);

    try {
      // Send data to your Express backend instead of Firebase
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          price: Number(price),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      alert("Product added successfully to MongoDB!");
      navigate('/'); 
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product. Check if your backend is running.");
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
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </label>
        
        <label>
          Price:
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;