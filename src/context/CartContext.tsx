import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../data/firebase';
import { useAuth } from './AuthContext';

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
  const addToCart = async (product: any) => {
    console.log("➕ [Cart] Adding product:", product.name);
    const newItems = [...cart.items];
    const existing = newItems.find((i: any) => i.product._id === product._id);
    
    if (existing) {
      existing.quantity += 1;
      console.log("🔄 [Cart] Increased quantity for:", product.name);
    } else {
      newItems.push({ product, quantity: 1 });
      console.log("🆕 [Cart] Added new item:", product.name);
    }
    
    const total = newItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
    await saveCart({ items: newItems, total });
  };

  // 4. Remove from Cart
  const remove = async (productId: string) => {
    console.log("🗑️ [Cart] Removing product ID:", productId);
    const newItems = cart.items.filter((i: any) => i.product._id !== productId);
    const total = newItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
    await saveCart({ items: newItems, total });
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
    <CartContext.Provider value={{ cart, addToCart, update, remove, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);