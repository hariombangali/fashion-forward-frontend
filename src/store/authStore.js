import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

// Backend returns { success, data: { ... } }
// Axios unwraps response.data = { success, data: { ... } }
// So actual payload is at response.data.data
const unwrap = (res) => res.data || res;

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('ff_token') || null,
  loading: false,

  login: async (email, password) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/auth/login', { email, password });
      const payload = unwrap(data); // { token, user }
      localStorage.setItem('ff_token', payload.token);
      set({ token: payload.token, user: payload.user, loading: false });
      toast.success('Logged in successfully');
      return payload; // { token, user } — LoginPage checks user.role
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  register: async (name, email, phone, password) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/auth/register', { name, email, phone, password });
      const payload = unwrap(data);
      localStorage.setItem('ff_token', payload.token);
      set({ token: payload.token, user: payload.user, loading: false });
      toast.success('Registration successful');
      return payload;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('ff_token');
    set({ user: null, token: null });
    toast.success('Logged out successfully');
  },

  fetchUser: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/auth/me');
      const payload = unwrap(data); // user object directly
      const user = payload.user || payload;
      set({ user, loading: false });
      return user;
    } catch (error) {
      set({ loading: false });
      // Don't show toast on initial fetch failure (token expired)
      localStorage.removeItem('ff_token');
      set({ token: null, user: null });
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ loading: true });
      const { data } = await api.put('/auth/profile', profileData);
      const payload = unwrap(data);
      const user = payload.user || payload;
      set({ user, loading: false });
      toast.success('Profile updated successfully');
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  },

  addAddress: async (addressData) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/auth/address', addressData);
      const payload = unwrap(data);
      const user = payload.user || payload;
      set({ user, loading: false });
      toast.success('Address added successfully');
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to add address');
      throw error;
    }
  },

  updateAddress: async (id, addressData) => {
    try {
      set({ loading: true });
      const { data } = await api.put(`/auth/address/${id}`, addressData);
      const payload = unwrap(data);
      const user = payload.user || payload;
      set({ user, loading: false });
      toast.success('Address updated successfully');
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to update address');
      throw error;
    }
  },

  deleteAddress: async (id) => {
    try {
      set({ loading: true });
      const { data } = await api.delete(`/auth/address/${id}`);
      const payload = unwrap(data);
      const user = payload.user || payload;
      set({ user, loading: false });
      toast.success('Address deleted successfully');
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to delete address');
      throw error;
    }
  },
}));

export { useAuthStore };
export default useAuthStore;
