import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const unwrap = (res) => res.data || res;

const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  totalPages: 0,
  currentPage: 1,
  loading: false,

  createOrder: async (payload) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/orders', payload);
      const p = unwrap(data);
      const order = p.order || p;
      set({ currentOrder: order, loading: false });
      toast.success('Order placed successfully');
      return order;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to create order');
      throw error;
    }
  },

  fetchMyOrders: async (page = 1) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/orders/my-orders', { params: { page } });
      // Backend returns { success, data: [orders], pagination: {pages, ...} }
      const orders = Array.isArray(data?.data) ? data.data : (data?.orders || []);
      const pagination = data?.pagination || {};
      set({
        orders,
        totalPages: pagination.pages || 0,
        currentPage: pagination.page || page,
        loading: false,
      });
      return { orders, pagination };
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  fetchOrderById: async (id) => {
    try {
      set({ loading: true });
      const { data } = await api.get(`/orders/${id}`);
      const p = unwrap(data);
      const order = p.order || p;
      set({ currentOrder: order, loading: false });
      return order;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch order');
      throw error;
    }
  },

  cancelOrder: async (id, reason = '') => {
    try {
      set({ loading: true });
      const { data } = await api.put(`/orders/${id}/cancel`, { reason });
      const p = unwrap(data);
      const order = p.order || p;
      set({ currentOrder: order, loading: false });
      toast.success('Order cancelled successfully');
      return order;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      throw error;
    }
  },
}));

export { useOrderStore };
export default useOrderStore;
