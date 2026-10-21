import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { useAuth } from './AuthContext';
import type { Product } from '../types';

const CartContext = createContext<any>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any>({ items: [], total: 0 });

  // 1. Load Cart on Start
  useEffect(() => {
    const fetchCart = async () => {
      console.log("🛒 [Cart] Fetching cart for:", user ? `User ${user.email}` : "Guest");
      
      if (user) {
        try {
          const docRef = doc(db, 'carts', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("✅ [Cart] Loaded from Firebase:", data);
            setCart(data);
          } else {
            console.log("📭 [Cart] No cart found in Firebase.");
            setCart({ items: [], total: 0 });
          }
        } catch (error) {
          console.error("❌ [Cart] Firebase fetch error:", error);
        }
      } else {
        const saved = localStorage.getItem('guest_cart');
        if (saved) {
          console.log("✅ [Cart] Loaded from LocalStorage:", JSON.parse(saved));
          setCart(JSON.parse(saved));
        } else {
          console.log("📭 [Cart] No guest cart found.");
        }
      }
    };
    fetchCart();
  }, [user]);

  // 2. Save Cart (Helper)
  const saveCart = async (newCart: any) => {
    console.log("💾 [Cart] Saving cart:", newCart);
    setCart(newCart);
    
    if (user) {
      try {
        await setDoc(doc(db, 'carts', user.uid), newCart);
        console.log("✅ [Cart] Saved to Firebase.");
      } catch (error) {
        console.error("❌ [Cart] Firebase save error:", error);
      }
    } else {
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      console.log("✅ [Cart] Saved to LocalStorage.");
    }
  };

  // 3. Add to Cart
  // Inside CartContext.tsx
const addToCart = (product: Product) => {
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if item already exists
  const existingItem = currentCart.find((item: Product) => item._id === product._id);
  
  if (existingItem) {
    // Optional: Handle quantity here if you want
    alert("Item already in cart!");
    return;
  }

  const updatedCart = [...currentCart, product];
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  setCart(updatedCart);
  alert(`${product.name} added to cart!`);
};

  // 4. Remove from Cart
  const removeFromCart = (productId: string) => {
  // Get current cart from local storage
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Filter out the item to be removed
  const updatedCart = currentCart.filter((item: any) => item._id !== productId);
  
  // Save back to local storage and update state
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  setCart(updatedCart);
};

  // 5. Clear Cart
  const clearCart = async () => {
    console.log("🗑️ [Cart] Clearing cart...");
    await saveCart({ items: [], total: 0 });
  };
  
  // 6. Update Quantity
  const update = async (productId: string, quantity: number) => {
    console.log(`🔄 [Cart] Updating quantity for ${productId} to ${quantity}`);
    const newItems = cart.items.map((i: any) => 
      i.product._id === productId ? { ...i, quantity } : i
    );
    const total = newItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
    await saveCart({ items: newItems, total });
  };

  // 🚨 FIX: Added 'clearCart' to the value object
  return (
    <CartContext.Provider value={{ cart, addToCart, update, remove: removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);