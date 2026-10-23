import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../data/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
// 👇 Update this import if your cart context is named differently
import { useCart } from '../../context/CartContext'; 

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart() || { addToCart: () => alert("Cart not connected") }; 

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User's Wishlist
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    // We look for wishlist items belonging to this user's email
    const q = query(collection(db, 'wishlist'), where('userEmail', '==', user.email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setWishlist(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching wishlist:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Remove from Wishlist
  const handleRemove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wishlist', id));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Please log in to view your wishlist</h2>
        <Link to="/login" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>My Wishlist</h1>

      {loading ? (
        <p>Loading your wishlist...</p>
      ) : wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '16px' }}>Your wishlist is empty</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Save your favorite items here to buy them later.</p>
          <Link to="/products" style={{ padding: '12px 24px', backgroundColor: '#111827', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {wishlist.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
              
              {/* Image */}
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                <Link to={`/product/${item.productId}`}>
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Link>
              </div>

              {/* Content */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  <Link to={`/product/${item.productId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link>
                </h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>
                  ₹{item.price?.toFixed(2)}
                </p>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      addToCart({ ...item, id: item.productId });
                      alert('Added to cart!');
                    }}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}