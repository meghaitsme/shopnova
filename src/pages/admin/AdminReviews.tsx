import { useState, useEffect } from 'react';
import { db } from '../../data/firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // 1. Fetch Reviews
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          productId: data.productId || 'Unknown Product',
          userName: data.userName || 'Anonymous',
          rating: Number(data.rating) || 0,
          comment: data.comment || '',
          createdAt: data.createdAt,
        });
      });
      setReviews(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching reviews:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Delete Review
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review? This cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast("Review deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting review:", err);
      showToast("Failed to delete review.", "error");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading reviews...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Moderate Reviews</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Total reviews: {reviews.length}</p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280' }}>No reviews have been left yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: '#2874f0', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {review.rating} ⭐
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{review.userName}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {review.createdAt?.toDate 
                      ? review.createdAt.toDate().toLocaleDateString() 
                      : new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '15px' }}>
                  "{review.comment}"
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  Product ID: {review.productId}
                </p>
              </div>

              <button 
                onClick={() => handleDelete(review.id)}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Delete Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}