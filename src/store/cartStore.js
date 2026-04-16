import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

// Backend returns { success, data: {...} } — axios unwraps once to response.data
// So the actual payload is at response.data.data
const unwrap = (res) => res.data || res;

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  shippingCharge: 0,
  total: 0,
  // Coupon state
  appliedCoupon: null,
  discount: 0,
  finalTotal: 0,
  loading: false,

  _applyStoredDiscount: (payload) => {
    const { discount, appliedCoupon } = get();
    // Auto-remove coupon if cart is empty or subtotal dropped below minimum
    if (!payload.items?.length || (payload.subtotal || 0) === 0) {
      return { discount: 0, appliedCoupon: null, finalTotal: payload.total || 0 };
    }
    if (appliedCoupon && (payload.subtotal || 0) < (appliedCoupon.minOrderValue || 0)) {
      toast.error(`Coupon removed: minimum order ₹${appliedCoupon.minOrderValue} required`);
      return { discount: 0, appliedCoupon: null, finalTotal: payload.total || 0 };
    }
    return {
      discount,
      appliedCoupon,
      finalTotal: Math.max(0, (payload.total || 0) - discount),
    };
  },

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      const payload = unwrap(data);
      const couponState = get()._applyStoredDiscount(payload);
      set({
        items: payload.items || [],
        itemCount: payload.itemCount ?? (payload.items?.length || 0),
        subtotal: payload.subtotal || 0,
        shippingCharge: payload.shippingCharge || 0,
        total: payload.total || 0,
        ...couponState,
        loading: false,
      });
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
      const payload = unwrap(data);
      const couponState = get()._applyStoredDiscount(payload);
      set({
        items: payload.items || [],
        itemCount: payload.itemCount ?? (payload.items?.length || 0),
        subtotal: payload.subtotal || 0,
        shippingCharge: payload.shippingCharge || 0,
        total: payload.total || 0,
        ...couponState,
        loading: false,
      });
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
      const payload = unwrap(data);
      const couponState = get()._applyStoredDiscount(payload);
      set({
        items: payload.items || [],
        itemCount: payload.itemCount ?? (payload.items?.length || 0),
        subtotal: payload.subtotal || 0,
        shippingCharge: payload.shippingCharge || 0,
        total: payload.total || 0,
        ...couponState,
        loading: false,
      });
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
      const payload = unwrap(data);
      const couponState = get()._applyStoredDiscount(payload);
      set({
        items: payload.items || [],
        itemCount: payload.itemCount ?? (payload.items?.length || 0),
        subtotal: payload.subtotal || 0,
        shippingCharge: payload.shippingCharge || 0,
        total: payload.total || 0,
        ...couponState,
        loading: false,
      });
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
        items: [], itemCount: 0, subtotal: 0, shippingCharge: 0,
        total: 0, discount: 0, finalTotal: 0, appliedCoupon: null, loading: false,
      });
      toast.success('Cart cleared');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  applyCoupon: async (code) => {
    try {
      const { subtotal } = get();
      const { data } = await api.post('/coupons/validate', { code, subtotal });
      const result = unwrap(data);
      if (result.valid) {
        const { total } = get();
        set({
          appliedCoupon: result.coupon,
          discount: result.discount,
          finalTotal: Math.max(0, total - result.discount),
        });
        toast.success('Coupon applied!');
      }
    } catch (error) {
      const reason =
        error.response?.data?.data?.reason ||
        error.response?.data?.message ||
        'Invalid coupon code';
      toast.error(reason);
      throw error;
    }
  },

  removeCoupon: () => {
    const { total } = get();
    set({ appliedCoupon: null, discount: 0, finalTotal: total });
  },
}));

export { useCartStore };
export default useCartStore;
