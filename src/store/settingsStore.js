import { create } from 'zustand';
import api from '../services/api';

const LS_DARK_KEY = 'ff_dark_mode';
const unwrap = (res) => res.data || res;

const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,

  // Dark mode — true = dark, false = light, null = not yet initialised
  darkMode: false,

  fetchSettings: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/settings');
      const payload = unwrap(data);
      set({ settings: payload, loading: false });

      // Initialise dark mode once settings are loaded
      get().initDarkMode(payload?.darkModeDefault ?? false);
    } catch {
      set({ loading: false });
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

  /**
   * Called once on app load.
   * Priority: localStorage override → admin default.
   */
  initDarkMode: (adminDefault) => {
    const stored = localStorage.getItem(LS_DARK_KEY);
    const isDark = stored !== null ? stored === 'true' : adminDefault;
    set({ darkMode: isDark });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  /**
   * User manually toggles dark mode.
   * Saves preference to localStorage so it survives refreshes.
   */
  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    localStorage.setItem(LS_DARK_KEY, String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));

export { useSettingsStore };
export default useSettingsStore;
