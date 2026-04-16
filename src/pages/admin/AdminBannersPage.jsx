import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Upload, X, Image as ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ToggleSwitch from '../../components/common/ToggleSwitch';

const PLACEMENT_OPTIONS = [
  { value: 'home-hero', label: 'Home Hero Carousel' },
  { value: 'home-secondary', label: 'Home Secondary' },
  { value: 'promo', label: 'Promo Banner' },
];

const DEFAULT_FORM = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  gradient: 'from-indigo-600 via-purple-500 to-fuchsia-500',
  ctaText: 'Shop Now',
  ctaLink: '/shop',
  sortOrder: 0,
  active: true,
  placement: 'home-hero',
  imageFit: 'cover',
  imagePosition: 'center',
  overlayOpacity: 50,
  textPosition: 'left',
};

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover', desc: 'Fill area (crops)' },
  { value: 'contain', label: 'Contain', desc: 'Fit inside (no crop)' },
  { value: 'fill', label: 'Fill', desc: 'Stretch to fill' },
  { value: 'none', label: 'Original', desc: 'No resize' },
];

const POSITION_OPTIONS = [
  { value: 'top-left', label: '↖' },
  { value: 'top', label: '↑' },
  { value: 'top-right', label: '↗' },
  { value: 'left', label: '←' },
  { value: 'center', label: '•' },
  { value: 'right', label: '→' },
  { value: 'bottom-left', label: '↙' },
  { value: 'bottom', label: '↓' },
  { value: 'bottom-right', label: '↘' },
];

// Tailwind-compatible object-position class mapping
const POSITION_CLASS = {
  'center': 'object-center',
  'top': 'object-top',
  'bottom': 'object-bottom',
  'left': 'object-left',
  'right': 'object-right',
  'top-left': 'object-left-top',
  'top-right': 'object-right-top',
  'bottom-left': 'object-left-bottom',
  'bottom-right': 'object-right-bottom',
};

const FIT_CLASS = {
  'cover': 'object-cover',
  'contain': 'object-contain',
  'fill': 'object-fill',
  'none': 'object-none',
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [gradientPresets, setGradientPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // banner object or 'new' or null
  const [form, setForm] = useState(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/banners/admin');
      const payload = data?.data ?? data;
      setBanners(Array.isArray(payload) ? payload : []);
      setGradientPresets(data?.gradientPresets || []);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openNew = () => {
    setForm(DEFAULT_FORM);
    setImageFile(null);
    setImagePreview('');
    setEditing('new');
  };

  const openEdit = (b) => {
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      imageUrl: b.imageUrl || '',
      gradient: b.gradient || 'from-indigo-600 via-purple-500 to-fuchsia-500',
      ctaText: b.ctaText || 'Shop Now',
      ctaLink: b.ctaLink || '/shop',
      sortOrder: b.sortOrder || 0,
      active: b.active !== false,
      placement: b.placement || 'home-hero',
      imageFit: b.imageFit || 'cover',
      imagePosition: b.imagePosition || 'center',
      overlayOpacity: b.overlayOpacity ?? 50,
      textPosition: b.textPosition || 'left',
    });
    setImageFile(null);
    setImagePreview(b.imageUrl || '');
    setEditing(b);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imageUrl') fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);

      if (editing === 'new') {
        await api.post('/banners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Banner created');
      } else {
        await api.put(`/banners/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Banner updated');
      }
      setEditing(null);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await api.delete(`/banners/${banner._id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (banner) => {
    try {
      await api.put(`/banners/${banner._id}/toggle`);
      toast.success(banner.active ? 'Banner hidden' : 'Banner activated');
      fetchBanners();
    } catch {
      toast.error('Toggle failed');
    }
  };

  const handleReorder = async (banner, direction) => {
    const sorted = [...banners].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const idx = sorted.findIndex((b) => b._id === banner._id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    try {
      await api.put('/banners/reorder', {
        ids: reordered.map((b) => b._id),
      });
      fetchBanners();
    } catch {
      toast.error('Reorder failed');
    }
  };

  return (
    <div className="p-4 md:p-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Banners & Hero Slides</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage homepage hero carousel, promo banners, and more
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      {/* Banners list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No banners yet</p>
          <button
            onClick={openNew}
            className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
          >
            + Add your first banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, idx) => (
            <div
              key={banner._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              {/* Preview */}
              <div
                className={`relative flex-shrink-0 w-full md:w-64 h-32 md:h-auto bg-gradient-to-br ${banner.gradient}`}
              >
                {banner.imageUrl && (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative p-4 h-full flex flex-col justify-end">
                  <p className="text-white text-xs font-semibold uppercase tracking-wider">
                    {banner.subtitle}
                  </p>
                  <h3 className="text-white font-bold line-clamp-2">
                    {banner.title}
                  </h3>
                </div>
                {!banner.active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Hidden
                  </div>
                )}
              </div>

              {/* Details + actions */}
              <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{banner.title}</h4>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                      {banner.placement}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Order: {banner.sortOrder}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{banner.description}</p>
                  <p className="text-xs text-indigo-600 mt-1 truncate">
                    CTA: "{banner.ctaText}" → {banner.ctaLink}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReorder(banner, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => handleReorder(banner, 'down')}
                    disabled={idx === banners.length - 1}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <ToggleSwitch
                    isOn={banner.active}
                    onToggle={() => handleToggle(banner)}
                    size="sm"
                  />
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {editing === 'new' ? 'Create Banner' : 'Edit Banner'}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Preview — reflects all settings live */}
              <div
                className={`relative h-48 rounded-xl overflow-hidden bg-gradient-to-br ${form.gradient}`}
              >
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={`absolute inset-0 w-full h-full ${FIT_CLASS[form.imageFit] || 'object-cover'} ${POSITION_CLASS[form.imagePosition] || 'object-center'}`}
                  />
                )}
                {/* Dark overlay controlled by opacity slider */}
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: (form.overlayOpacity || 0) / 100 }}
                />
                <div
                  className={`relative h-full p-5 flex flex-col justify-end text-white ${
                    form.textPosition === 'center' ? 'items-center text-center'
                    : form.textPosition === 'right' ? 'items-end text-right'
                    : 'items-start text-left'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    {form.subtitle || 'Subtitle'}
                  </p>
                  <h4 className="text-xl font-bold drop-shadow">{form.title || 'Banner title'}</h4>
                  <p className="text-xs opacity-80 mt-0.5">{form.description}</p>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image <span className="text-gray-400 text-xs">(optional, falls back to gradient)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600">
                    <Upload size={16} />
                    {imageFile ? imageFile.name : (imagePreview ? 'Change image' : 'Click to upload')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setImageFile(null); setForm({ ...form, imageUrl: '' }); }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Image Display Settings — only when image is set */}
              {imagePreview && (
                <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100 space-y-4">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <ImageIcon size={14} className="text-indigo-600" />
                    Image Display Settings
                  </p>

                  {/* Fit */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Resize / Fit</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {FIT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, imageFit: opt.value })}
                          className={`text-left p-2.5 rounded-lg border-2 transition ${
                            form.imageFit === opt.value
                              ? 'border-indigo-600 bg-white shadow-sm'
                              : 'border-gray-200 bg-white/50 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                          <p className="text-[10px] text-gray-500">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position — 3x3 grid compass */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Image Position</label>
                    <div className="grid grid-cols-3 gap-1 max-w-[180px]">
                      {POSITION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, imagePosition: opt.value })}
                          className={`aspect-square flex items-center justify-center text-lg rounded-lg border-2 transition ${
                            form.imagePosition === opt.value
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                          title={opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dark overlay opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        Dark Overlay (for text readability)
                      </label>
                      <span className="text-xs font-mono text-indigo-600 font-bold">
                        {form.overlayOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={form.overlayOpacity}
                      onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>None</span>
                      <span>Subtle</span>
                      <span>Heavy</span>
                    </div>
                  </div>

                  {/* Text alignment */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Text Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['left', 'center', 'right'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setForm({ ...form, textPosition: pos })}
                          className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition capitalize ${
                            form.textPosition === pos
                              ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm'
                              : 'border-gray-200 bg-white/50 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gradient Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientPresets.map((grad) => (
                    <button
                      key={grad}
                      type="button"
                      onClick={() => setForm({ ...form, gradient: grad })}
                      className={`h-10 rounded-lg bg-gradient-to-br ${grad} ring-2 transition ${
                        form.gradient === grad ? 'ring-indigo-600 scale-105' : 'ring-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Text fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Festive Collection"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Up to 40% OFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Celebrate in style with our curated festive wear"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="/shop?category=Saree"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active (visible on site)</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editing === 'new' ? 'Create Banner' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
