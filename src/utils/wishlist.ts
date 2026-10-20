export interface WishlistProduct {
  _id: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
  description?: string;
  stock?: number;
}

function getWishlistKey(): string {
  const savedUser = localStorage.getItem('user');

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const identity = user._id || user.id || user.email;

      if (identity) {
        return `shopnova_wishlist_${identity}`;
      }
    } catch {
      // Fall back if the stored user data is invalid.
    }
  }

  return 'shopnova_wishlist_guest';
}

export function getWishlist(): WishlistProduct[] {
  try {
    const saved = localStorage.getItem(getWishlistKey());
    const products = saved ? JSON.parse(saved) : [];
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

function saveWishlist(products: WishlistProduct[]): void {
  localStorage.setItem(
    getWishlistKey(),
    JSON.stringify(products)
  );
}

export function isWishlisted(productId: string): boolean {
  return getWishlist().some(
    (product) => product._id === productId
  );
}

export function toggleWishlist(
  product: WishlistProduct
): boolean {
  const products = getWishlist();
  const exists = products.some(
    (item) => item._id === product._id
  );

  if (exists) {
    saveWishlist(
      products.filter((item) => item._id !== product._id)
    );
    return false;
  }

  saveWishlist([...products, product]);
  return true;
}

export function removeFromWishlist(productId: string): void {
  saveWishlist(
    getWishlist().filter((product) => product._id !== productId)
  );
}