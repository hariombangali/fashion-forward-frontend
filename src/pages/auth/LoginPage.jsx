import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/* ── decorative floating blobs ── */
const Blob = ({ className }) => (
  <div className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse ${className}`} />
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const settings = useSettingsStore((s) => s.settings);
  const storeName = settings?.storeName || 'Fashion Forward';
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    try {
      const result = await login(formData.email, formData.password);
      if (result?.user?.role === 'admin') navigate('/admin');
      else if (result?.user?.role === 'wholesaler') navigate('/wholesale');
      else navigate('/');
    } catch {
      // error handled by store
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════
          LEFT PANEL — Fashion Branding
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex-col justify-between p-14">

        {/* Blobs */}
        <Blob className="w-96 h-96 bg-pink-500 -top-20 -left-20" />
        <Blob className="w-80 h-80 bg-indigo-400 bottom-10 right-10" />
        <Blob className="w-64 h-64 bg-purple-400 top-1/2 left-1/3" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg overflow-hidden">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white font-extrabold text-xl">{storeName.charAt(0)}</span>
            )}
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">{storeName}</span>
        </motion.div>

        {/* Center hero text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          {/* Small label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pink-200">New Season Arrivals</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5">
            Style is a way<br />
            <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              to say who you are
            </span>
          </h1>

          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Sign in to explore the latest trends, exclusive deals, and your curated wardrobe.
          </p>

          {/* Decorative dots */}
          <div className="flex items-center gap-2 mt-8">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="block rounded-full bg-white/30"
                style={{ width: i === 0 ? 28 : 8, height: 8 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 p-5 rounded-2xl bg-white/8 backdrop-blur border border-white/15"
        >
          <p className="text-white/80 text-sm leading-relaxed italic">
            "Fashion is the armor to survive the reality of everyday life."
          </p>
          <p className="text-white/40 text-xs font-semibold mt-2 uppercase tracking-widest">— Bill Cunningham</p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 bg-white relative overflow-hidden">

        {/* Subtle background gradient — mobile only bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-pink-50/40 pointer-events-none" />

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:hidden mb-8 flex flex-col items-center relative z-10"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-indigo-200 mb-3 overflow-hidden">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white font-extrabold text-xl">{storeName.charAt(0)}</span>
            )}
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-gradient">
            {storeName}
          </span>
        </motion.div>

        {/* Card */}
        <div className="w-full max-w-[400px] relative z-10">

          {/* Heading */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm">
              Sign in to continue your style journey
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">
                Email Address
              </label>
              <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-gray-50 ${
                focusedField === 'email'
                  ? 'border-indigo-500 bg-white shadow-sm shadow-indigo-100'
                  : errors.email
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <Mail className={`absolute left-3.5 w-4.5 h-4.5 transition-colors ${
                  focusedField === 'email' ? 'text-indigo-500' : 'text-gray-400'
                }`} style={{ width: 18, height: 18 }} />
                <input
                  type="email"
                  {...register('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none rounded-xl"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-pink-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-gray-50 ${
                focusedField === 'password'
                  ? 'border-indigo-500 bg-white shadow-sm shadow-indigo-100'
                  : errors.password
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <Lock className={`absolute left-3.5 transition-colors ${
                  focusedField === 'password' ? 'text-indigo-500' : 'text-gray-400'
                }`} style={{ width: 18, height: 18 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <EyeOff style={{ width: 18, height: 18 }} />
                    : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-300/50 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #f472b6 100%)' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center gap-4 my-6"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </motion.div>

          {/* Sign up link */}
          <motion.p
            custom={5} variants={fadeUp} initial="hidden" animate="visible"
            className="text-center text-sm text-gray-500"
          >
            New to {storeName}?{' '}
            <Link
              to="/signup"
              className="font-bold text-indigo-600 hover:text-pink-500 transition-colors"
            >
              Create your account →
            </Link>
          </motion.p>

          {/* Trust badges */}
          <motion.div
            custom={6} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-8 flex items-center justify-center gap-5"
          >
            {['Free Shipping', 'Easy Returns', 'Secure Payment'].map((badge) => (
              <span key={badge} className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 flex-shrink-0" />
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
