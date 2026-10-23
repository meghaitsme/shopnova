import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import your providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext'; // 👈 The new one we just created

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* The ToastProvider must go OUTSIDE the Auth/Cart providers so it can be used anywhere */}
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);