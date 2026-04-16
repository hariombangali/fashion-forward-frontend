import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Megaphone, Zap, Phone, Bell, Save, Upload, X, Plus, Trash2, Eye,
  Globe, MapPin, Mail, MessageCircle, Truck,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import useSettingsStore from '../../store/settingsStore';

const TABS = [
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'announcement', label: 'Announcement', icon: Megaphone },
  { key: 'flashSale', label: 'Flash Sale', icon: Zap },
  { key: 'contact', label: 'Contact', icon: Phone },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

const GRADIENT_PRESETS = [
  'from-indigo-600 via-purple-500 to-fuchsia-500',
  'from-pink-500 via-red-500 to-yellow-500',
  'from-green-400 via-emerald-500 to-teal-600',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-violet-600 via-purple-600 to-indigo-600',
  'from-rose-500 via-pink-500 to-purple-500',
  'from-slate-800 via-gray-700 to-zinc-800',
];

const TAILWIND_GRADIENT_STOPS = [
  { value: 'from-indigo-600', label: 'Indigo' },
  { value: 'from-purple-600', label: 'Purple' },
  { value: 'from-pink-500', label: 'Pink' },
  { value: 'from-rose-500', label: 'Rose' },
  { value: 'from-red-500', label: 'Red' },
  { value: 'from-orange-500', label: 'Orange' },
  { value: 'from-amber-500', label: 'Amber' },
  { value: 'from-yellow-500', label: 'Yellow' },
  { value: 'from-green-500', label: 'Green' },
  { value: 'from-emerald-500', label: 'Emerald' },
  { value: 'from-teal-500', label: 'Teal' },
  { value: 'from-cyan-500', label: 'Cyan' },
  { value: 'from-blue-600', label: 'Blue' },
  { value: 'from-violet-600', label: 'Violet' },
  { value: 'from-fuchsia-500', label: 'Fuchsia' },
  { value: 'from-slate-800', label: 'Slate' },
  { value: 'from-gray-700', label: 'Gray' },
  { value: 'from-zinc-800', label: 'Zinc' },
];

const viaStops = TAILWIND_GRADIENT_STOPS.map((s) => ({
  value: s.value.replace('from-', 'via-'),
  label: s.label,
}));

const toStops = TAILWIND_GRADIENT_STOPS.map((s) => ({
  value: s.value.replace('from-', 'to-'),
  label: s.label,
}));

const DEFAULT_SETTINGS = {
  storeName: '',
  logoUrl: '',
  faviconUrl: '',
  tagline: '',
  theme: {
    primaryColor: '#4f46e5',
    accentColor: '#ec4899',
    gradientFrom: 'from-indigo-600',
    gradientVia: 'via-purple-500',
    gradientTo: 'to-fuchsia-500',
  },
  announcement: {
    enabled: false,
    messages: [''],
    link: '',
    bgGradient: 'from-indigo-600 via-purple-500 to-fuchsia-500',
    textColor: 'text-white',
  },
  flashSale: {
    enabled: false,
    title: '',
    subtitle: '',
    endsAt: '',
    ctaText: '',
    ctaLink: '',
    bgGradient: 'from-indigo-600 via-purple-500 to-fuchsia-500',
  },
  contact: { phone: '', whatsapp: '', email: '', address: '' },
  social: { facebook: '', instagram: '', twitter: '', youtube: '' },
  freeShippingThreshold: 999,
  flatShippingRate: 80,
  liveNotifications: { enabled: false, lookbackDays: 7 },
};

export default function AdminThemePage() {
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const refreshGlobalSettings = useSettingsStore((s) => s.fetchSettings);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const logoRef = useRef(null);
  const faviconRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/settings/admin');
      const s = data?.data ?? data;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...s,
        theme: { ...DEFAULT_SETTINGS.theme, ...s?.theme },
        announcement: {
          ...DEFAULT_SETTINGS.announcement,
          ...s?.announcement,
          messages: s?.announcement?.messages?.length ? s.announcement.messages : [''],
        },
        flashSale: { ...DEFAULT_SETTINGS.flashSale, ...s?.flashSale },
        contact: { ...DEFAULT_SETTINGS.contact, ...s?.contact },
        social: { ...DEFAULT_SETTINGS.social, ...s?.social },
        liveNotifications: { ...DEFAULT_SETTINGS.liveNotifications, ...s?.liveNotifications },
      });
      if (s?.logoUrl) setLogoPreview(s.logoUrl);
      if (s?.faviconUrl) setFaviconPreview(s.faviconUrl);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(url);
    } else {
      setFaviconFile(file);
      setFaviconPreview(url);
    }
  };

  const updateField = (path, value) => {
    setSettings((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      const root = parts[0];
      return { ...prev, [root]: { ...prev[root], [parts[1]]: value } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const hasFiles = logoFile || faviconFile;
      if (hasFiles) {
        const fd = new FormData();
        fd.append('settings', JSON.stringify(settings));
        if (logoFile) fd.append('logo', logoFile);
        if (faviconFile) fd.append('favicon', faviconFile);
        await api.put('/settings', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.put('/settings', settings);
      }
      toast.success('Settings saved successfully');
      setLogoFile(null);
      setFaviconFile(null);
      // Refresh global settings store so all components see new values immediately
      await refreshGlobalSettings();
      // Also re-fetch local admin-form settings (to pick up new uploaded URLs)
      await fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Announcement message helpers
  const addMessage = () => {
    updateField('announcement.messages', [...(settings.announcement.messages || []), '']);
  };

  const removeMessage = (idx) => {
    const msgs = [...settings.announcement.messages];
    msgs.splice(idx, 1);
    updateField('announcement.messages', msgs.length ? msgs : ['']);
  };

  const updateMessage = (idx, val) => {
    const msgs = [...settings.announcement.messages];
    msgs[idx] = val;
    updateField('announcement.messages', msgs);
  };

  const currentGradient = `${settings.theme.gradientFrom} ${settings.theme.gradientVia} ${settings.theme.gradientTo}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Theme Customizer</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Customize branding, announcements, flash sales, contact info, and notifications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── Branding ─── */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
              <h3 className="text-base font-semibold text-gray-800">Store Branding</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateField('storeName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Fashion Forward"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Your style, your way"
                  />
                </div>
              </div>

              {/* Logo upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo <span className="text-gray-400 text-xs">(max 5MB)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1" />
                    )}
                    <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600">
                      <Upload size={16} />
                      {logoFile ? logoFile.name : 'Upload logo'}
                      <input
                        ref={logoRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                    {logoPreview && (
                      <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon <span className="text-gray-400 text-xs">(max 5MB)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {faviconPreview && (
                      <img src={faviconPreview} alt="Favicon" className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1" />
                    )}
                    <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600">
                      <Upload size={16} />
                      {faviconFile ? faviconFile.name : 'Upload favicon'}
                      <input
                        ref={faviconRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'favicon')}
                        className="hidden"
                      />
                    </label>
                    {faviconPreview && (
                      <button type="button" onClick={() => { setFaviconFile(null); setFaviconPreview(''); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateField('theme.primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateField('theme.primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => updateField('theme.accentColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme.accentColor}
                      onChange={(e) => updateField('theme.accentColor', e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient builder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Builder</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <select
                      value={settings.theme.gradientFrom}
                      onChange={(e) => updateField('theme.gradientFrom', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {TAILWIND_GRADIENT_STOPS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Via</label>
                    <select
                      value={settings.theme.gradientVia}
                      onChange={(e) => updateField('theme.gradientVia', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {viaStops.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <select
                      value={settings.theme.gradientTo}
                      onChange={(e) => updateField('theme.gradientTo', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {toStops.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`mt-3 h-10 rounded-lg bg-gradient-to-r ${currentGradient} ring-1 ring-black/5`} />
                <p className="text-xs text-gray-400 mt-1 font-mono">{currentGradient}</p>
              </div>
            </div>
          )}

          {/* ─── Announcement ─── */}
          {activeTab === 'announcement' && (
            <div className="space-y-4">
              {/* Live preview */}
              {settings.announcement.enabled && settings.announcement.messages?.some((m) => m.trim()) && (
                <div className={`bg-gradient-to-r ${settings.announcement.bgGradient} py-2 px-4 rounded-xl`}>
                  <p className={`text-center text-sm font-medium ${settings.announcement.textColor || 'text-white'}`}>
                    {settings.announcement.messages.filter((m) => m.trim())[0]}
                    {settings.announcement.link && (
                      <span className="underline ml-2 opacity-80">{settings.announcement.link}</span>
                    )}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">Announcement Bar</h3>
                  <ToggleSwitch
                    isOn={settings.announcement.enabled}
                    onToggle={() => updateField('announcement.enabled', !settings.announcement.enabled)}
                    labelOn="On"
                    labelOff="Off"
                    size="sm"
                  />
                </div>

                {/* Messages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Messages (rotates if multiple)</label>
                  <div className="space-y-2">
                    {(settings.announcement.messages || ['']).map((msg, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => updateMessage(idx, e.target.value)}
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={`Message ${idx + 1}`}
                        />
                        {settings.announcement.messages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMessage(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addMessage}
                    className="mt-2 flex items-center gap-1.5 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    <Plus size={14} />
                    Add message
                  </button>
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                  <input
                    type="text"
                    value={settings.announcement.link}
                    onChange={(e) => updateField('announcement.link', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="/shop?sale=true"
                  />
                </div>

                {/* Background gradient presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Gradient</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENT_PRESETS.map((grad) => (
                      <button
                        key={grad}
                        type="button"
                        onClick={() => updateField('announcement.bgGradient', grad)}
                        className={`h-10 rounded-lg bg-gradient-to-r ${grad} ring-2 transition ${
                          settings.announcement.bgGradient === grad ? 'ring-indigo-600 scale-105' : 'ring-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Text color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color Class</label>
                  <input
                    type="text"
                    value={settings.announcement.textColor}
                    onChange={(e) => updateField('announcement.textColor', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Flash Sale ─── */}
          {activeTab === 'flashSale' && (
            <div className="space-y-4">
              {/* Live preview */}
              {settings.flashSale.enabled && settings.flashSale.title && (
                <div className={`bg-gradient-to-r ${settings.flashSale.bgGradient} rounded-xl p-5 text-white`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold">{settings.flashSale.title}</h4>
                      <p className="text-sm opacity-90">{settings.flashSale.subtitle}</p>
                      {settings.flashSale.endsAt && (
                        <p className="text-xs opacity-75 mt-1">
                          Ends: {new Date(settings.flashSale.endsAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {settings.flashSale.ctaText && (
                      <span className="inline-block px-5 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm">
                        {settings.flashSale.ctaText}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">Flash Sale Banner</h3>
                  <ToggleSwitch
                    isOn={settings.flashSale.enabled}
                    onToggle={() => updateField('flashSale.enabled', !settings.flashSale.enabled)}
                    labelOn="On"
                    labelOff="Off"
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={settings.flashSale.title}
                      onChange={(e) => updateField('flashSale.title', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Flash Sale Live!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={settings.flashSale.subtitle}
                      onChange={(e) => updateField('flashSale.subtitle', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Up to 70% off on select items"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ends At</label>
                  <input
                    type="datetime-local"
                    value={settings.flashSale.endsAt ? settings.flashSale.endsAt.slice(0, 16) : ''}
                    onChange={(e) => updateField('flashSale.endsAt', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                    <input
                      type="text"
                      value={settings.flashSale.ctaText}
                      onChange={(e) => updateField('flashSale.ctaText', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                    <input
                      type="text"
                      value={settings.flashSale.ctaLink}
                      onChange={(e) => updateField('flashSale.ctaLink', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="/shop?sale=flash"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Gradient</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENT_PRESETS.map((grad) => (
                      <button
                        key={grad}
                        type="button"
                        onClick={() => updateField('flashSale.bgGradient', grad)}
                        className={`h-10 rounded-lg bg-gradient-to-r ${grad} ring-2 transition ${
                          settings.flashSale.bgGradient === grad ? 'ring-indigo-600 scale-105' : 'ring-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Contact ─── */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Phone size={18} className="text-indigo-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={settings.contact.phone}
                        onChange={(e) => updateField('contact.phone', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-green-500" />
                      <span className="text-sm text-gray-500">+91</span>
                      <input
                        type="text"
                        value={settings.contact.whatsapp}
                        onChange={(e) => updateField('contact.whatsapp', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <input
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => updateField('contact.email', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="support@fashionforward.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={settings.contact.address}
                        onChange={(e) => updateField('contact.address', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="123 Fashion Street, Mumbai"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <h3 className="text-base font-semibold text-gray-800">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-600" />
                      <input
                        type="url"
                        value={settings.social.facebook}
                        onChange={(e) => updateField('social.facebook', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-pink-500" />
                      <input
                        type="url"
                        value={settings.social.instagram}
                        onChange={(e) => updateField('social.instagram', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-sky-500" />
                      <input
                        type="url"
                        value={settings.social.twitter}
                        onChange={(e) => updateField('social.twitter', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://twitter.com/yourpage"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-red-500" />
                      <input
                        type="url"
                        value={settings.social.youtube}
                        onChange={(e) => updateField('social.youtube', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://youtube.com/yourchannel"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Bell size={18} className="text-indigo-600" />
                    Live Purchase Notifications
                  </h3>
                  <ToggleSwitch
                    isOn={settings.liveNotifications.enabled}
                    onToggle={() => updateField('liveNotifications.enabled', !settings.liveNotifications.enabled)}
                    labelOn="On"
                    labelOff="Off"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lookback Days
                    <span className="text-gray-400 text-xs ml-1">(show orders from last N days)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.liveNotifications.lookbackDays}
                    onChange={(e) => updateField('liveNotifications.lookbackDays', Number(e.target.value))}
                    className="w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-indigo-600" />
                  Shipping Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">{'\u20B9'}</span>
                      <input
                        type="number"
                        min="0"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => updateField('freeShippingThreshold', Number(e.target.value))}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flat Shipping Rate</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">{'\u20B9'}</span>
                      <input
                        type="number"
                        min="0"
                        value={settings.flatShippingRate}
                        onChange={(e) => updateField('flatShippingRate', Number(e.target.value))}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Charged when order is below free shipping threshold</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky Save button */}
      <div className="sticky bottom-0 bg-gray-100/90 backdrop-blur-sm py-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full md:w-auto md:ml-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
