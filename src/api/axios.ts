import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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

/*Open frontend/src/api/axios.ts. You must tell Axios to grab the token from localStorage and attach it to the Authorization header for every request. This is what makes the "Add to Cart" button work. */