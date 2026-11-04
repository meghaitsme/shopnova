import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number; // <--- 1. Added to interface
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from Firestore when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          setCart(cartDoc.data().items || []);
        }
      } else {
        setCart([]); // Clear cart if logged out
      }
    };
    fetchCart();
  }, [user]);

  // Save cart to Firestore whenever it changes
  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items: newCart });
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const clearCart = () => saveCart([]);

   // 2. Calculate total item count (sum of all quantities)
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    // 3. Add itemCount to the provider value
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};