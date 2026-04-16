import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, MapPin, Lock, Plus, Pencil, Trash2, Loader2, Package, LogOut, Heart, ChevronRight, LayoutDashboard, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const TABS = [
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'addresses', label: 'My Addresses', icon: MapPin },
  { id: 'password', label: 'Change Password', icon: Lock },
];

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

const addressSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required').regex(/^[6-9]\d{9}$/, 'Invalid phone'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required').regex(/^\d{6}$/, 'Invalid pincode'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function ProfileTab() {
  const { user, updateProfile, loading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    await updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          {...register('phone')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          maxLength={10}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
      </button>
    </form>
  );
}

function AddressesTab() {
  const { user, addAddress, updateAddress, deleteAddress, loading } = useAuthStore();
  const addresses = user?.addresses || [];
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const openEdit = (addr) => {
    setEditingId(addr._id);
    setShowForm(true);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const openNew = () => {
    setEditingId(null);
    setShowForm(true);
    reset({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateAddress(editingId, data);
      } else {
        await addAddress(data);
      }
      setShowForm(false);
      setEditingId(null);
    } catch {
      // handled by store
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    await deleteAddress(id);
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <div key={addr._id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{addr.fullName}</p>
              <p className="text-sm text-gray-600">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
              {addr.isDefault && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                  Default
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(addr)} className="p-2 text-gray-400 hover:text-indigo-600 transition">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(addr._id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={openNew}
          className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-lg p-4 space-y-3 max-w-lg">
          <h3 className="font-medium text-gray-900">{editingId ? 'Edit Address' : 'New Address'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input {...register('fullName')} placeholder="Full Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <input {...register('phone')} placeholder="Phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          <div>
            <input {...register('addressLine1')} placeholder="Address Line 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
          </div>
          <input {...register('addressLine2')} placeholder="Address Line 2 (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input {...register('city')} placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <input {...register('state')} placeholder="State" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <input {...register('pincode')} placeholder="Pincode" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PasswordTab() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
        <input
          type="password"
          {...register('currentPassword')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          {...register('newPassword')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Change Password'}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { user, logout, fetchUser } = useAuthStore();

  // user is already loaded by App.jsx on mount; no need to re-fetch
  // eslint-disable-next-line no-unused-vars
  const _fetchUser = fetchUser;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const quickLinks = [
    { to: '/my-orders', icon: Package, label: 'My Orders', desc: 'Track your purchases' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Your saved items' },
  ];

  if (user?.role === 'admin') {
    quickLinks.push({ to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard', desc: 'Manage store' });
  }
  if (user?.role === 'wholesaler') {
    quickLinks.push({ to: '/wholesale', icon: Building2, label: 'Wholesale Shop', desc: 'Bulk catalog' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* User Header Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 md:p-6 mb-5 md:mb-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl md:text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">{user?.name || 'User'}</h1>
              <p className="text-white/80 text-sm truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                {user?.role || 'customer'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links Grid — mobile friendly */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 md:mb-6">
          {quickLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Account Settings */}
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 px-1">
          Account Settings
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Tabs sidebar (desktop: vertical with flex-col stretch; mobile: horizontal chips) */}
          <div className="md:w-56 flex-shrink-0 md:flex md:flex-col">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:block flex md:flex-col overflow-x-auto scrollbar-hide">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex md:w-full items-center gap-2 md:gap-3 px-4 py-3 text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'bg-indigo-50 text-indigo-600 md:border-l-4 border-b-2 md:border-b-0 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 md:border-l-4 md:border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop: Logout pinned to bottom via mt-auto flex-grow spacer */}
            <div className="hidden md:flex md:flex-col md:flex-1 md:justify-end md:mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-semibold py-3 rounded-xl shadow-sm hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 bg-white rounded-xl p-5 md:p-6 shadow-sm">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'password' && <PasswordTab />}
          </div>
        </div>

        {/* Mobile: Logout button at the very bottom of the page */}
        <div className="md:hidden mt-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-semibold py-3.5 rounded-xl shadow-sm hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
