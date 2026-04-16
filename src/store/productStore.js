import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

// Helper: backend returns { success, data: {...} } — axios unwraps one level
// so response.data = { success, data: {...} }
// We need response.data.data for the actual payload
const unwrap = (res) => res.data || res;

const useProductStore = create((set) => ({
  products: [],
  wholesaleProducts: [],
  currentProduct: null,
  categories: [],
  totalPages: 0,
  currentPage: 1,
  loading: false,
  filters: {},

  fetchProducts: async (params = {}) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/products', { params });
      const payload = unwrap(data);
      set({
        products: payload.products || (Array.isArray(payload) ? payload : []),
        totalPages: payload.totalPages || 0,
        currentPage: payload.page || 1,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  fetchWholesaleProducts: async (params = {}) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/products/wholesale', { params });
      const payload = unwrap(data);
      set({
        wholesaleProducts: payload.products || (Array.isArray(payload) ? payload : []),
        totalPages: payload.totalPages || 0,
        currentPage: payload.page || 1,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch wholesale products');
    }
  },

  fetchProductBySlug: async (slug) => {
    try {
      set({ loading: true });
      const { data } = await api.get(`/products/slug/${slug}`);
      const payload = unwrap(data);
      set({ currentProduct: payload.product || payload, loading: false });
      return payload.product || payload;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch product');
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/products/categories');
      const payload = unwrap(data);
      const cats = Array.isArray(payload) ? payload : (payload.categories || []);
      set({ categories: cats });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/products/featured');
      const payload = unwrap(data);
      const prods = Array.isArray(payload) ? payload : (payload.products || []);
      set({ products: prods, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch featured products');
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },
}));

export { useProductStore };
export default useProductStore;
