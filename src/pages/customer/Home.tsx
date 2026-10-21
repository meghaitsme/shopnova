import { Link } from 'react-router-dom'; // 🚨 FIX: Removed the word 'type'
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  // Check if the current user is the admin
  const isAdmin = user?.email === 'admin@test.com';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Shop by category</h1>
      <h2>Featured products</h2>

      {/* ... your product grid goes here ... */}

      {/* 🚨 Only show this button if the user is an admin */}
      {isAdmin && (
        <Link to="/admin/add-product">
          <button style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            marginTop: '20px',
            fontWeight: 'bold'
          }}>
            + Add New Product
          </button>
        </Link>
      )}
    </div>
  );
}