import axios from 'axios';

// ✅ CRITICAL FIX: Use environment variable for production, fallback to localhost for dev
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 🚨 If no token, generate or get a guest ID
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = Math.random().toString(36).substring(2, 15); // Generate random ID
      localStorage.setItem('guestId', guestId);
    }
    config.headers['x-guest-id'] = guestId; // Send it to backend
  }
  return config;
});

export default api;