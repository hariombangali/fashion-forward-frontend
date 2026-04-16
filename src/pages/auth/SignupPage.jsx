import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, Building, MapPin, FileText, ShoppingBag, CheckCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const customerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const wholesalerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    shopName: z.string().min(2, 'Shop name is required'),
    gstNumber: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittedWholesaler, setSubmittedWholesaler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({ businessProof: null, shopPhoto: null, aadhar: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(role === 'customer' ? customerSchema : wholesalerSchema),
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFiles({ businessProof: null, shopPhoto: null, aadhar: null });
    reset();
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const removeFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
  };

  const onSubmit = async (formData) => {
    if (role === 'customer') {
      try {
        await registerUser(formData.name, formData.email, `+91${formData.phone}`, formData.password);
        navigate('/');
      } catch {
        // handled by store
      }
    } else {
      // Validate at least one document is uploaded
      if (!files.businessProof && !files.shopPhoto && !files.aadhar) {
        toast.error('Please upload at least one verification document');
        return;
      }

      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('email', formData.email);
        fd.append('phone', `+91${formData.phone}`);
        fd.append('shopName', formData.shopName);
        if (formData.gstNumber) fd.append('gstNumber', formData.gstNumber);
        fd.append('city', formData.city);
        fd.append('password', formData.password);

        // Attach documents
        if (files.businessProof) fd.append('businessProof', files.businessProof);
        if (files.shopPhoto) fd.append('shopPhoto', files.shopPhoto);
        if (files.aadhar) fd.append('aadhar', files.aadhar);

        await api.post('/auth/apply-wholesaler', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSubmittedWholesaler(true);
        toast.success('Application submitted successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit application');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Success screen for wholesaler
  if (submittedWholesaler) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a wholesaler with Fashion Forward.
              Our team will review your application and contact you within 24-48 hours.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition w-full"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-4">
              <UserPlus className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join Fashion Forward today</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition ${
                role === 'customer'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('wholesaler')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition ${
                role === 'wholesaler'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="w-4 h-4" />
              Wholesaler
            </button>
          </div>

          {role === 'wholesaler' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              ℹ️ Wholesaler applications require admin approval. You'll be notified within 24-48 hours.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full pl-20 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {/* Wholesaler-specific fields */}
            {role === 'wholesaler' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register('shopName')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Your Shop Name"
                    />
                  </div>
                  {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register('gstNumber')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition uppercase"
                      placeholder="23ABCDE1234F1Z5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Indore"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>

                {/* Document Uploads */}
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    Verification Documents
                  </p>
                  <p className="text-xs text-gray-500 -mt-1">
                    Upload at least one (Images only, max 5MB each)
                  </p>

                  {[
                    { key: 'businessProof', label: 'Business Proof / GST Certificate' },
                    { key: 'shopPhoto', label: 'Shop Photo' },
                    { key: 'aadhar', label: 'Aadhar Card' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      {files[key] ? (
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-green-300 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <ImageIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate">{files[key].name}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              ({(files[key].size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(key)}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition text-xs text-gray-600">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span>Click to upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(key, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {role === 'customer' ? 'Create Account' : 'Submit Application'}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
