import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.put('/auth/change-password', d),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
};

// ─── Products ──────────────────────────────────────────────────────────────
export const productAPI = {
  getHome: () => api.get('/products/home'),
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (catId, params) => api.get(`/products/category/${catId}`, { params }),
  addReview: (id, d) => api.post(`/products/${id}/reviews`, d),
};

// ─── Categories ────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories', { params: { limit: 50 } }),
};

// ─── Cart ──────────────────────────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (d) => api.post('/cart/items', d),
  updateItem: (itemId, d) => api.put(`/cart/items/${itemId}`, d),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// ─── Orders ────────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (d) => api.post('/orders', d),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
};

// ─── Payments ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  initialize: (d) => api.post('/payments/initialize', d),
  verify: (d) => api.post('/payments/verify', d),
  getHistory: () => api.get('/payments/history'),
  // OPay specific endpoints
  initializeOPay: (d) => api.post('/payments/opay/initialize', d),
  verifyOPay: (reference) => api.get(`/payments/opay/verify/${reference}`),
};

// ─── Wishlist ──────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (d) => api.post('/wishlist', d),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Addresses ─────────────────────────────────────────────────────────────
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  create: (d) => api.post('/addresses', d),
  update: (id, d) => api.put(`/addresses/${id}`, d),
  delete: (id) => api.delete(`/addresses/${id}`),
};

export default api;
