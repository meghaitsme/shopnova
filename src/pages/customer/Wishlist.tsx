
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../data/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {

  const { user } = useAuth();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Wishlist

  useEffect(() => {

    if (!user?.uid) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'wishlist'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const fetched: any[] = [];

        snapshot.forEach((document) => {

          fetched.push({
            id: document.id,
            ...document.data()
          });

        });

        setWishlist(fetched);
        setLoading(false);

      },
      (error) => {

        console.error(
          'Error fetching wishlist:',
          error
        );

        setLoading(false);

      }
    );

    return () => unsubscribe();

  }, [user?.uid]);

  // 2. Remove from Wishlist

  const handleRemove = async (id: string) => {

    try {

      await deleteDoc(
        doc(db, 'wishlist', id)
      );

      console.log('Wishlist item removed');

    } catch (error: any) {
  console.error('Wishlist error:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);

  alert(
    `Wishlist Error: ${error.code || error.message}`
  );
}

  };

  // 3. Add to Cart

  const handleAddToCart = (item: any) => {

  addToCart({
    ...item,
    id: item.productId,
    image: item.imageUrl
  });

  alert('Added to Cart!');

};

  // 4. Login Check

  if (!user) {

    return (

      <div style={{
        padding: '80px 24px',
        textAlign: 'center'
      }}>

        <h2>Please log in to view your wishlist</h2>

        <Link to="/login">
          Log In
        </Link>

      </div>

    );

  }

  // 5. Loading

  if (loading) {

    return <p>Loading your wishlist...</p>;

  }

  // 6. Empty Wishlist

  if (wishlist.length === 0) {

    return (

      <div style={{
        padding: '60px',
        textAlign: 'center'
      }}>

        <h2>Your wishlist is empty ❤️</h2>

        <p>
          Save your favorite products here.
        </p>

        <Link to="/products">
          Explore Products
        </Link>

      </div>

    );

  }

  // 7. Display Wishlist Products

  return (

    <div style={{
      padding: '40px 24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>

      <h1>My Wishlist ❤️</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>

        {wishlist.map((item) => (

          <div
            key={item.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >

            {/* Product Image */}

            <Link to={`/product/${item.productId}`}>

              <img
                src={
                  item.imageUrl ||
                  'https://via.placeholder.com/300x200'
                }
                alt={item.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />

            </Link>

            {/* Product Details */}

            <div style={{ padding: '16px' }}>

              <h3>

                <Link
                  to={`/product/${item.productId}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  {item.name}
                </Link>

              </h3>

              <p style={{
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                ₹{Number(item.price || 0).toFixed(2)}
              </p>

              {/* Actions */}

              <div style={{
                display: 'flex',
                gap: '8px'
              }}>

                <button
                  onClick={() => handleAddToCart(item)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    padding: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
