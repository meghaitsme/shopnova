// Types are compile-time only, but we add a runtime marker
// so Vite keeps this module in the bundle.

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  _id: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  status: string;
  shippingAddress: Address;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

// Runtime marker so Vite/ESBuild keeps this module
export const __types_module_marker = true;