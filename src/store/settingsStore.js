import { create } from 'zustand';
import api from '../services/api';

const unwrap = (res) => res.data || res;

const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/settings');
      const payload = unwrap(data);
      set({ settings: payload, loading: false });
    } catch (error) {
      set({ loading: false });
      // fail silently — settings are optional
    }
  },

  updateSettings: async (settings) => {
    try {
      const { data } = await api.put('/settings', settings);
      const payload = unwrap(data);
      set({ settings: payload });
      return payload;
    } catch (error) {
      throw error;
    }
  },
}));

export { useSettingsStore };
export default useSettingsStore;
