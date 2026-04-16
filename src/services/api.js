import axios from 'axios';

// In dev: /api (proxied by Vite to localhost:5000)
// In prod: VITE_API_URL from environment (e.g. https://your-backend.onrender.com/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 clear localStorage and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
