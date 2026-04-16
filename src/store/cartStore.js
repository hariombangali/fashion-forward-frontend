import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

// Backend returns { success, data: {...} } — axios unwraps once to response.data
// So the actual payload is at response.data.data
const unwrap = (res) => res.data || res;

const setCartState = (payload) => ({
  items: payload.items || [],
  itemCount: payload.itemCount ?? (payload.items?.length || 0),
  subtotal: payload.subtotal || 0,
  shippingCharge: payload.shippingCharge || 0,
  total: payload.total || 0,
  loading: false,
});

const useCartStore = create((set) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  shippingCharge: 0,
  total: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      set(setCartState(unwrap(data)));
    } catch (error) {
      set({ loading: false });
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to fetch cart');
      }
    }
  },

  addToCart: async (productId, size, color, quantity = 1) => {
    try {
      set({ loading: true });
      await api.post('/cart', { productId, size, color, quantity });
      const { data } = await api.get('/cart');
      set(setCartState(unwrap(data)));
      toast.success('Added to cart');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      set({ loading: true });
      await api.put(`/cart/${itemId}`, { quantity });
      const { data } = await api.get('/cart');
      set(setCartState(unwrap(data)));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ loading: true });
      await api.delete(`/cart/${itemId}`);
      const { data } = await api.get('/cart');
      set(setCartState(unwrap(data)));
      toast.success('Item removed from cart');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true });
      await api.delete('/cart');
      set({
        items: [], itemCount: 0, subtotal: 0, shippingCharge: 0, total: 0, loading: false,
      });
      toast.success('Cart cleared');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  },
}));

export { useCartStore };
export default useCartStore;
