import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../data/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';

export default function PDP() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Track the specific wishlist document ID for Firebase
  const [wishlistDocId, setWishlistDocId] = useState<string | null>(null);

  // Review States
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Product
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ _id: docSnap.id, ...docSnap.data() });
        }

        // 2. Fetch Reviews for this product
        const reviewsQuery = query(
          collection(db, 'reviews'), 
          where('productId', '==', id),
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        let reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        reviewsData.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime() || 0;
          const dateB = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime() || 0;
          return dateB - dateA;
        });
        setReviews(reviewsData);
        
        // 3. Check if item is already in the user's Firebase Wishlist
        if (user?.email) {
          const wishQuery = query(
            collection(db, 'wishlist'), 
            where('userEmail', '==', user.email),
            where('productId', '==', id)
          );
          const wishSnap = await getDocs(wishQuery);
          if (!wishSnap.empty) {
            setWishlistDocId(wishSnap.docs[0].id); 
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductAndReviews();
  }, [id, user]);

  const handleAddToCart = () => {
    if (product) addToCart(product);
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  // Toggle Wishlist using Firebase
  const toggleWishlist = async () => {
    if (!product) return;
    
    if (!user) {
      alert("Please log in to save items to your wishlist.");
      return;
    }

    try {
      if (wishlistDocId) {
        await deleteDoc(doc(db, 'wishlist', wishlistDocId));
        setWishlistDocId(null);
      } else {
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userEmail: user.email,
          productId: product._id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || product.image || '',
          addedAt: new Date().toISOString()
        });
        setWishlistDocId(docRef.id);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      alert("Failed to update wishlist.");
    }
  };

  // Submit Review Function
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email,
        rating: rating,
        comment: comment,
        createdAt: new Date(),
      });

      const newReview = {
        id: docRef.id,
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email,
        rating: rating,
        comment: comment,
        createdAt: new Date(),
      };
      
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(5);
      alert("Review submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Check console for details.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '50px', textAlign: 'center' }}>Product not found. <Link to="/products">Go back</Link></div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* PRODUCT DETAILS SECTION */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
          
          {/* Left Column: Image and Buttons */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={toggleWishlist} 
              style={{ 
                position: 'absolute', top: '20px', right: '20px', 
                background: 'white', border: '1px solid #ddd', borderRadius: '50%', 
                width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' 
              }}
            >
              {wishlistDocId ? '❤️' : '🤍'}
            </button>
            <img src={product.image || "https://placehold.co/400x400"} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            
            {/* ✅ Disable buttons if out of stock */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button 
                onClick={handleAddToCart} 
                disabled={product.stock <= 0}
                style={{ 
                  flex: '1', 
                  backgroundColor: product.stock <= 0 ? '#d1d5db' : '#ff9f00', 
                  color: 'white', 
                  padding: '15px', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                {product.stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              <button 
                onClick={handleBuyNow} 
                disabled={product.stock <= 0}
                style={{ 
                  flex: '1', 
                  backgroundColor: product.stock <= 0 ? '#d1d5db' : '#fb641b', 
                  color: 'white', 
                  padding: '15px', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                {product.stock <= 0 ? 'Unavailable' : '⚡ Buy Now'}
              </button>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div style={{ flex: '1.5', minWidth: '300px', backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{product.name}</h1>
            <p style={{ color: '#388e3c', fontSize: '14px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Special Price</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '36px' }}>{formatPrice(product.price)}</h2>
              <span style={{ color: '#388e3c', fontWeight: 'bold' }}>33% off</span>
            </div>
            <p style={{ color: '#555', lineHeight: '1.6' }}>{product.description || "No description available."}</p>
            <ul style={{ color: '#555', marginTop: '15px', paddingLeft: '20px' }}>
              <li><strong>Category:</strong> {product.category}</li>
              
              {/* ✅ Stock availability text */}
              <li>
                <strong>Availability:</strong>{' '}
                <span style={{ 
                  color: product.stock > 0 ? '#388e3c' : '#ef4444', 
                  fontWeight: 'bold' 
                }}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Ratings & Reviews</h2>
          
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
            
            {/* Left: Write a Review */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3>Write a Review</h3>
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Poor)</option>
                  <option value={1}>⭐ (1 - Terrible)</option>
                </select>
                <textarea 
                  placeholder="Share your thoughts about this product..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                  required
                />
                <button type="submit" disabled={isSubmittingReview} style={{ backgroundColor: '#2874f0', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                {!user && <p style={{ color: 'red', fontSize: '12px' }}>You must be logged in to submit a review.</p>}
              </form>
            </div>

            {/* Right: Display Reviews */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '48px', margin: 0 }}>{averageRating}</h1>
                <div>
                  <p style={{ margin: 0, fontSize: '20px' }}>{'⭐'.repeat(Math.round(Number(averageRating)))}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{reviews.length} Reviews</p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#666' }}>No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ backgroundColor: '#2874f0', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {rev.rating} ⭐
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{rev.comment}</span>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '12px' }}>
                      By {rev.userName} on {rev.createdAt?.toDate ? rev.createdAt.toDate().toLocaleDateString() : new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}