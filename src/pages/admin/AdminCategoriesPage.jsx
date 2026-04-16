import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon,
  LayoutGrid, Search, ToggleLeft, ToggleRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  sortOrder: 0,
  active: true,
  imageFile: null,
  imagePreview: '',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = new
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products/categories?admin=true');
      setCategories(data?.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPanelOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
      active: cat.active,
      imageFile: null,
      imagePreview: cat.image || '',
    });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditing(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      fd.append('sortOrder', form.sortOrder);
      fd.append('active', form.active);
      if (form.imageFile) fd.append('image', form.imageFile);
      // If editing and image was cleared
      if (editing && !form.imagePreview && !form.imageFile) fd.append('image', '');

      if (editing) {
        await api.put(`/products/categories/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated');
      } else {
        await api.post('/products/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category created');
      }
      await fetchCategories();
      closePanel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setDeletingId(cat._id);
    try {
      await api.delete(`/products/categories/${cat._id}`);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const fd = new FormData();
      fd.append('active', !cat.active);
      await api.put(`/products/categories/${cat._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCategories((prev) =>
        prev.map((c) => c._id === cat._id ? { ...c, active: !cat.active } : c)
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSort = async (cat, dir) => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c._id === cat._id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const newA = b.sortOrder;
    const newB = a.sortOrder;

    try {
      await Promise.all([
        api.put(`/products/categories/${a._id}`, new URLSearchParams({ sortOrder: newA })),
        api.put(`/products/categories/${b._id}`, new URLSearchParams({ sortOrder: newB })),
      ]);
      setCategories((prev) =>
        prev.map((c) => {
          if (c._id === a._id) return { ...c, sortOrder: newA };
          if (c._id === b._id) return { ...c, sortOrder: newB };
          return c;
        })
      );
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500">Manage store categories and their display</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No categories found</p>
            <p className="text-sm mt-1">Click "Add Category" to create one</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Products</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Sort</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((cat, i) => (
                <motion.tr
                  key={cat._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Name + image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs">
                    <p className="truncate">{cat.description || '—'}</p>
                  </td>

                  {/* Product count */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      cat.productCount > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {cat.productCount}
                    </span>
                  </td>

                  {/* Sort order arrows */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleSort(cat, 'up')}
                        disabled={i === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <span className="text-xs text-gray-400 w-5 text-center">{cat.sortOrder}</span>
                      <button
                        onClick={() => handleSort(cat, 'down')}
                        disabled={i === filtered.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </td>

                  {/* Toggle active */}
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(cat)} className="inline-flex">
                      {cat.active ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat._id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deletingId === cat._id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Side panel — Create / Edit */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closePanel}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {editing ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={closePanel} className="p-1.5 rounded-full hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Image upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative cursor-pointer group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-400 transition-colors aspect-[16/9] bg-gray-50 flex items-center justify-center"
                  >
                    {form.imagePreview ? (
                      <>
                        <img
                          src={form.imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center px-4">
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Click to upload image</p>
                        <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — max 5 MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {form.imagePreview && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageFile: null, imagePreview: '' }))}
                      className="mt-1.5 text-xs text-red-500 hover:text-red-700 transition"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Kurtas, Sarees, Dresses"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description shown on the category page"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                {/* Sort order + Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.sortOrder}
                      onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Lower = shown first</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition ${
                        form.active
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {form.active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : editing ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
