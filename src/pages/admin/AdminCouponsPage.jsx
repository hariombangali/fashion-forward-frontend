import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Tag, Ticket, Percent, DollarSign, Loader2, Search,
  Calendar, Users, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ToggleSwitch from '../../components/common/ToggleSwitch';

const DEFAULT_COUPON = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscount: '',
  minOrderValue: '',
  applicableRole: 'all',
  startsAt: '',
  expiresAt: '',
  maxUses: 0,
  maxUsesPerUser: 1,
  active: true,
};

function StatusBadge({ coupon }) {
  const now = new Date();
  const expired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
  if (expired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
        Expired
      </span>
    );
  }
  if (!coupon.active) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        Disabled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      Active
    </span>
  );
}

function formatDiscount(coupon) {
  if (coupon.discountType === 'percentage') {
    let s = `${coupon.discountValue}%`;
    if (coupon.maxDiscount) s += ` (max \u20B9${coupon.maxDiscount})`;
    return s;
  }
  return `\u20B9${coupon.discountValue} flat`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | coupon obj
  const [form, setForm] = useState(DEFAULT_COUPON);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons/admin');
      const payload = data?.data ?? data;
      setCoupons(Array.isArray(payload) ? payload : []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm(DEFAULT_COUPON);
    setEditing('new');
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue ?? '',
      maxDiscount: coupon.maxDiscount ?? '',
      minOrderValue: coupon.minOrderValue ?? '',
      applicableRole: coupon.applicableRole || 'all',
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      maxUses: coupon.maxUses ?? 0,
      maxUsesPerUser: coupon.maxUsesPerUser ?? 1,
      active: coupon.active !== false,
    });
    setEditing(coupon);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error('Discount value is required');
      return;
    }

    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      discountValue: Number(form.discountValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      maxUses: Number(form.maxUses) || 0,
      maxUsesPerUser: Number(form.maxUsesPerUser) || 1,
    };

    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      } else {
        await api.put(`/coupons/${editing._id}`, payload);
        toast.success('Coupon updated');
      }
      setEditing(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/coupons/${coupon._id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (coupon) => {
    setTogglingId(coupon._id);
    try {
      await api.put(`/coupons/${coupon._id}/toggle`);
      toast.success(coupon.active ? 'Coupon disabled' : 'Coupon activated');
      fetchCoupons();
    } catch {
      toast.error('Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Preview text
  const previewText = () => {
    if (!form.discountValue) return '';
    const val = Number(form.discountValue);
    const min = form.minOrderValue ? Number(form.minOrderValue) : 0;
    if (form.discountType === 'percentage') {
      let txt = `Customer gets ${val}% off`;
      if (form.maxDiscount) txt += ` (up to \u20B9${form.maxDiscount})`;
      if (min > 0) txt += ` on orders above \u20B9${min}`;
      return txt;
    }
    let txt = `Customer gets \u20B9${val} off`;
    if (min > 0) txt += ` on orders above \u20B9${min}`;
    return txt;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket size={22} className="text-indigo-600" />
            Coupon Codes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create and manage discount coupons for your store
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      {coupons.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      )}

      {/* Coupon List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{search ? 'No coupons match your search' : 'No coupons yet'}</p>
          {!search && (
            <button onClick={openNew} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">
              + Create your first coupon
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Discount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Min Order</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Uses</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Valid Until</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3">
                      <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">
                      {coupon.description || '-'}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {coupon.minOrderValue ? `\u20B9${coupon.minOrderValue}` : '-'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                      {coupon.usedCount ?? 0} / {coupon.maxUses || '\u221E'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge coupon={coupon} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ToggleSwitch
                          isOn={coupon.active}
                          onToggle={() => handleToggle(coupon)}
                          loading={togglingId === coupon._id}
                          size="sm"
                        />
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCoupons.map((coupon) => (
              <div key={coupon._id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded text-sm">
                      {coupon.code}
                    </span>
                    <p className="text-xs text-gray-500 mt-1.5">{coupon.description || 'No description'}</p>
                  </div>
                  <StatusBadge coupon={coupon} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Discount</p>
                    <p className="font-semibold text-gray-800">{formatDiscount(coupon)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Min Order</p>
                    <p className="font-semibold text-gray-800">
                      {coupon.minOrderValue ? `\u20B9${coupon.minOrderValue}` : 'None'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Uses</p>
                    <p className="font-semibold text-gray-800 font-mono">
                      {coupon.usedCount ?? 0} / {coupon.maxUses || '\u221E'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Valid Until</p>
                    <p className="font-semibold text-gray-800">{formatDate(coupon.expiresAt)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <ToggleSwitch
                    isOn={coupon.active}
                    onToggle={() => handleToggle(coupon)}
                    loading={togglingId === coupon._id}
                    size="sm"
                    labelOn="Active"
                    labelOff="Off"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900">
                  {editing === 'new' ? 'Create Coupon' : 'Edit Coupon'}
                </h3>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Preview */}
                {previewText() && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                      <Tag size={14} />
                      {previewText()}
                    </p>
                  </div>
                )}

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="SUMMER20"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Summer sale 20% off on all items"
                  />
                </div>

                {/* Discount type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                        form.discountType === 'percentage'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={form.discountType === 'percentage'}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="sr-only"
                      />
                      <Percent size={16} />
                      <span className="text-sm font-medium">Percentage</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                        form.discountType === 'flat'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        value="flat"
                        checked={form.discountType === 'flat'}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="sr-only"
                      />
                      <DollarSign size={16} />
                      <span className="text-sm font-medium">Flat Amount</span>
                    </label>
                  </div>
                </div>

                {/* Discount value + max discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value <span className="text-red-500">*</span>
                      <span className="text-gray-400 text-xs ml-1">
                        ({form.discountType === 'percentage' ? '%' : '\u20B9'})
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder={form.discountType === 'percentage' ? '20' : '100'}
                      required
                    />
                  </div>
                  {form.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Discount <span className="text-gray-400 text-xs">(\u20B9, optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.maxDiscount}
                        onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="500"
                      />
                    </div>
                  )}
                </div>

                {/* Min order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Value <span className="text-gray-400 text-xs">(\u20B9)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="499"
                  />
                </div>

                {/* Applicable role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applicable To</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'all', label: 'All Users' },
                      { value: 'customer', label: 'Customers' },
                      { value: 'wholesaler', label: 'Wholesalers' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition text-sm font-medium ${
                          form.applicableRole === opt.value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="applicableRole"
                          value={opt.value}
                          checked={form.applicableRole === opt.value}
                          onChange={(e) => setForm({ ...form, applicableRole: e.target.value })}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      Starts At
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      Expires At
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Usage limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users size={14} className="inline mr-1" />
                      Max Uses <span className="text-gray-400 text-xs">(0 = unlimited)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Uses Per User
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxUsesPerUser}
                      onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <ToggleSwitch
                    isOn={form.active}
                    onToggle={() => setForm({ ...form, active: !form.active })}
                    labelOn="Yes"
                    labelOff="No"
                    size="sm"
                  />
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
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? 'Saving...' : editing === 'new' ? 'Create Coupon' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
