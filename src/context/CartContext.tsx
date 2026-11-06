
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import { db } from '../data/firebase';

import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

import { useAuth } from './AuthContext';

// ==========================================
// 1. CART ITEM INTERFACE
// ==========================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// ==========================================
// 2. PRODUCT INPUT INTERFACE
// ==========================================

interface CartProduct {
  id?: string;
  _id?: string;
  productId?: string;
  name?: string;
  price?: number | string;
  image?: string | string[];
  imageUrl?: string;
  stock?: number | string;
  [key: string]: unknown;
}

// ==========================================
// 3. CART CONTEXT INTERFACE
// ==========================================

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: CartProduct,
    quantity?: number
  ) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  cartLoading: boolean;
}

// ==========================================
// 4. CREATE CART CONTEXT
// ==========================================

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

// ==========================================
// 5. VALIDATE SAVED CART
// ==========================================

const normalizeCart = (items: unknown): CartItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Record<string, unknown> => {
      return (
        !!item &&
        typeof item === 'object' &&
        !Array.isArray(item)
      );
    })
    .map((item): CartItem | null => {
      const id = String(item.id || '').trim();
      const name = String(item.name || '').trim();
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !id ||
        !name ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return null;
      }

      return {
        id,
        name,
        price,
        image:
          typeof item.image === 'string'
            ? item.image
            : '',
        quantity
      };
    })
    .filter((item): item is CartItem => item !== null);
};

// ==========================================
// 6. CART PROVIDER
// ==========================================

export const CartProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const { user } = useAuth();

  // Keep the latest cart available to callbacks.
  const cartRef = useRef<CartItem[]>([]);

  // Prevent old fetch requests from updating new sessions.
  const requestVersion = useRef(0);

  // Serialize Firestore writes.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  // ==========================================
  // 7. UPDATE LOCAL CART
  // ==========================================

  const updateLocalCart = useCallback((items: CartItem[]) => {
    cartRef.current = items;
    setCart(items);
  }, []);

  // ==========================================
  // 8. SAVE CART TO FIRESTORE
  // ==========================================

  const saveCart = useCallback(
    (newCart: CartItem[], uid: string) => {
      const safeCart = normalizeCart(newCart);

      // Update UI immediately.
      updateLocalCart(safeCart);

      const cartRefFirestore = doc(db, 'carts', uid);

      // Capture this exact snapshot so later changes
      // cannot alter an already queued write.
      const snapshot = safeCart.map(item => ({ ...item }));

      saveQueue.current = saveQueue.current
        .catch(error => {
          console.error('Previous cart save failed:', error);
        })
        .then(async () => {
          await setDoc(
            cartRefFirestore,
            {
              items: snapshot,
              updatedAt: new Date()
            },
            { merge: true }
          );

          console.log('Cart saved successfully');
        })
        .catch(error => {
          console.error('Error saving cart:', error);
        });
    },
    [updateLocalCart]
  );

  // ==========================================
  // 9. FETCH CART FROM FIRESTORE
  // ==========================================

  useEffect(() => {
    const version = ++requestVersion.current;
    let active = true;

    const fetchCart = async () => {
      setCartLoading(true);
      updateLocalCart([]);

      if (!user?.uid) {
        setCartLoading(false);
        return;
      }

      try {
        const cartDocument = await getDoc(
          doc(db, 'carts', user.uid)
        );

        if (
          !active ||
          version !== requestVersion.current
        ) {
          return;
        }

        const savedItems = cartDocument.exists()
          ? cartDocument.data().items
          : [];

        updateLocalCart(normalizeCart(savedItems));

        console.log('Cart loaded successfully');
      } catch (error) {
        if (active) {
          console.error('Error fetching cart:', error);
        }
      } finally {
        if (
          active &&
          version === requestVersion.current
        ) {
          setCartLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      active = false;
    };
  }, [user?.uid, updateLocalCart]);

  // ==========================================
  // 10. ADD PRODUCT TO CART
  // ==========================================

  const addToCart = useCallback(
    (
      product: CartProduct,
      requestedQuantity = 1
    ): boolean => {
      if (!user?.uid) {
        console.error('Please log in before saving your cart.');
        return false;
      }

      if (
        !product ||
        typeof product !== 'object'
      ) {
        return false;
      }

      const productId = String(
        product.id ||
        product.productId ||
        product._id ||
        ''
      ).trim();

      const name = String(product.name || '').trim();
      const price = Number(product.price);

      if (!productId || !name) {
        console.error('Invalid product information:', product);
        return false;
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        console.error('Invalid product price:', product.price);
        return false;
      }

      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1
      ) {
        console.error('Invalid requested quantity');
        return false;
      }

      const hasStock =
        product.stock !== undefined &&
        product.stock !== null;

      const stock = hasStock
        ? Number(product.stock)
        : undefined;

      if (
        hasStock &&
        (!Number.isInteger(stock) || stock! < 0)
      ) {
        console.error('Invalid product stock');
        return false;
      }

      if (
        hasStock &&
        requestedQuantity > stock!
      ) {
        console.error('Requested quantity exceeds stock');
        return false;
      }

      const existing = cartRef.current.find(
        item => item.id === productId
      );

      const newQuantity =
        (existing?.quantity || 0) + requestedQuantity;

      if (
        hasStock &&
        newQuantity > stock!
      ) {
        console.error('Total cart quantity exceeds stock');
        return false;
      }

      const rawImage = product.image || product.imageUrl;

      const image = Array.isArray(rawImage)
        ? rawImage[0] || ''
        : typeof rawImage === 'string'
          ? rawImage.split(',')[0].trim()
          : '';

      const newCart: CartItem[] = existing
        ? cartRef.current.map(item =>
            item.id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  name,
                  price,
                  image: image || item.image
                }
              : item
          )
        : [
            ...cartRef.current,
            {
              id: productId,
              name,
              price,
              image,
              quantity: requestedQuantity
            }
          ];

      saveCart(newCart, user.uid);

      return true;
    },
    [user?.uid, saveCart]
  );

  // ==========================================
  // 11. REMOVE PRODUCT
  // ==========================================

  const removeFromCart = useCallback(
    (productId: string) => {
      if (!user?.uid || !productId) return;

      const newCart = cartRef.current.filter(
        item => item.id !== productId
      );

      saveCart(newCart, user.uid);
    },
    [user?.uid, saveCart]
  );

  // ==========================================
  // 12. CLEAR CART
  // ==========================================

  const clearCart = useCallback(() => {
    if (!user?.uid) return;

    saveCart([], user.uid);
  }, [user?.uid, saveCart]);

  // ==========================================
  // 13. CALCULATE ITEM COUNT
  // ==========================================

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // ==========================================
  // 14. PROVIDE CART CONTEXT
  // ==========================================

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        itemCount,
        cartLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ==========================================
// 15. CUSTOM CART HOOK
// ==========================================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return context;
};
