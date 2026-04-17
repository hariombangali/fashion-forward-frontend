import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const unwrap = (res) => res.data || res;

const useAdminStore = create((set) => ({
  dashboardStats: {},
  allOrders: [],
  totalOrderPages: 0,
  allCustomers: [],
  allWholesalers: [],
  applications: [],
  salesReport: [],
  lowStockProducts: [],
  analytics: null,
  loading: false,

  fetchDashboard: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/dashboard');
      const p = unwrap(data);
      set({ dashboardStats: p, loading: false });
      return p;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  },

  fetchAllOrders: async (params = {}) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/orders', { params });
      const p = unwrap(data);
      set({
        allOrders: p.orders || (Array.isArray(p) ? p : []),
        totalOrderPages: p.totalPages || 0,
        loading: false,
      });
      return p;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  updateOrderStatus: async (id, status, note) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status, note });
      toast.success('Order status updated');
      return unwrap(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
      throw error;
    }
  },

  confirmCOD: async (id, note = '') => {
    try {
      const { data } = await api.put(`/admin/orders/${id}/confirm-cod`, { note });
      toast.success('COD payment confirmed');
      return unwrap(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm COD');
      throw error;
    }
  },

  fetchApplications: async (status) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/applications', { params: status ? { status } : {} });
      const p = unwrap(data);
      set({
        applications: p.applications || (Array.isArray(p) ? p : []),
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  approveWholesaler: async (id) => {
    try {
      const { data } = await api.put(`/admin/applications/${id}/approve`);
      toast.success('Wholesaler approved');
      return unwrap(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve wholesaler');
      throw error;
    }
  },

  rejectWholesaler: async (id, reviewNote) => {
    try {
      const { data } = await api.put(`/admin/applications/${id}/reject`, { reviewNote });
      toast.success('Wholesaler rejected');
      return unwrap(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject wholesaler');
      throw error;
    }
  },

  fetchCustomers: async (page = 1, search = '') => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/customers', { params: { page, search } });
      const p = unwrap(data);
      set({
        allCustomers: p.customers || p.users || (Array.isArray(p) ? p : []),
        loading: false,
      });
      return p;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch customers');
    }
  },

  fetchWholesalers: async (page = 1, search = '') => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/wholesalers', { params: { page, search } });
      const p = unwrap(data);
      set({
        allWholesalers: p.wholesalers || p.users || (Array.isArray(p) ? p : []),
        loading: false,
      });
      return p;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch wholesalers');
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-status`);
      toast.success('User status updated');
      return unwrap(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
      throw error;
    }
  },

  fetchSalesReport: async (from, to) => {
    try {
      set({ loading: true });
      // Backend expects dateFrom/dateTo
      const { data } = await api.get('/admin/reports/sales', {
        params: { dateFrom: from, dateTo: to },
      });
      const p = unwrap(data);
      const report = p.report || p.sales || (Array.isArray(p) ? p : []);
      set({ salesReport: report, loading: false });
      return report;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch sales report');
    }
  },

  fetchAnalytics: async (days = 30) => {
    try {
      set({ loading: true });
      const { data } = await api.get('/admin/analytics', { params: { days } });
      const p = unwrap(data);
      set({ analytics: p, loading: false });
      return p;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  fetchLowStock: async () => {
    try {
      const { data } = await api.get('/admin/reports/low-stock');
      const p = unwrap(data);
      const products = p.products || (Array.isArray(p) ? p : []);
      set({ lowStockProducts: products });
      return products;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch low stock products');
    }
  },
}));

export { useAdminStore };
export default useAdminStore;
