import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import {
  Truck, Wallet, MapPin, ShieldCheck, ArrowRight, Sparkles,
  TrendingUp, Star, ChevronRight, Tag, Heart,
} from 'lucide-react';
import useProductStore from '../../store/productStore';
import api from '../../services/api';
import FlashSaleBanner from '../../components/common/FlashSaleBanner';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Fallback slides shown if no banners configured in admin
const FALLBACK_SLIDES = [
  {
    title: 'Festive Collection',
    subtitle: 'Up to 40% OFF',
    description: 'Celebrate in style with our curated festive wear',
    gradient: 'from-pink-500 via-rose-400 to-orange-400',
    ctaText: 'Shop Festive',
    ctaLink: '/shop?category=Saree',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh Drops Weekly',
    description: 'Discover the latest trends in Indian fashion',
    gradient: 'from-indigo-600 via-purple-500 to-fuchsia-500',
    ctaText: 'Explore Now',
    ctaLink: '/shop',
  },
];

const trustBadges = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: Wallet, title: 'Cash on Delivery', desc: 'Pay at your doorstep' },
  { icon: MapPin, title: 'Pan-India', desc: 'We deliver everywhere' },
  { icon: ShieldCheck, title: 'Quality Assured', desc: '100% genuine products' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

function ProductCard({ product, index = 0 }) {
  const price = product.retailPrice ?? product.price ?? 0;
  const mrp = product.retailMRP ?? product.mrp ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden">
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              -{discount}%
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
          >
            <Heart className="w-4 h-4" />
          </button>
          <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/400x533?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x533?text=No+Image'; }}
            />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600 mb-1">
              {product.category?.name || product.category || 'Fashion'}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 truncate mb-2 group-hover:text-indigo-600 transition">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">₹{price}</span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ============================================================
   CATEGORY GRID — premium bento-box style with unique styles per category
   ============================================================ */
const CATEGORY_STYLES = {
  Kurti: {
    emoji: '👗', gradient: 'from-pink-500 via-rose-400 to-orange-300',
    bg: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=75',
    tag: 'Bestseller',
  },
  Saree: {
    emoji: '🥻', gradient: 'from-fuchsia-600 via-pink-500 to-red-400',
    bg: 'https://images.unsplash.com/photo-1610189044667-b24c1a3d3bd7?w=600&q=75',
    tag: 'Festive',
  },
  'Suit Set': {
    emoji: '✨', gradient: 'from-violet-600 via-purple-500 to-indigo-500',
    bg: 'https://images.unsplash.com/photo-1617059062149-c99b5c1a6e64?w=600&q=75',
    tag: 'Ethnic',
  },
  Lehenga: {
    emoji: '💃', gradient: 'from-rose-600 via-pink-600 to-fuchsia-500',
    bg: 'https://images.unsplash.com/photo-1594736797933-d0d3085cf6ad?w=600&q=75',
    tag: 'Bridal',
  },
  Shirt: {
    emoji: '👔', gradient: 'from-sky-600 via-blue-500 to-indigo-500',
    bg: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=75',
    tag: 'Office',
  },
  'T-Shirt': {
    emoji: '👕', gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    bg: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=75',
    tag: 'Casual',
  },
  'Jeans & Trousers': {
    emoji: '👖', gradient: 'from-slate-700 via-blue-700 to-indigo-700',
    bg: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=75',
    tag: 'Denim',
  },
  Dress: {
    emoji: '👗', gradient: 'from-amber-500 via-orange-500 to-red-500',
    bg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=75',
    tag: 'Western',
  },
  'Kids Wear': {
    emoji: '🧒', gradient: 'from-yellow-400 via-orange-400 to-pink-400',
    bg: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=75',
    tag: 'Little Stars',
  },
  'Dupatta & Stole': {
    emoji: '🧣', gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bg: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=75',
    tag: 'Accessory',
  },
};

const DEFAULT_STYLE = {
  emoji: '🛍️',
  gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  bg: null,
  tag: 'Explore',
};

function CategoryGrid({ categoryList }) {
  const getStyle = (name) => CATEGORY_STYLES[name] || DEFAULT_STYLE;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {categoryList.map((cat, i) => {
        const style = getStyle(cat.name);
        // First tile is featured (larger) on desktop
        const isFeatured = i === 0;
        return (
          <motion.div
            key={cat._id || cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -6 }}
            className={isFeatured ? 'md:col-span-2 md:row-span-2' : ''}
          >
            <Link
              to={`/shop?category=${cat.slug || cat.name}`}
              className={`group relative block overflow-hidden rounded-2xl md:rounded-3xl shadow-sm hover:shadow-2xl transition-all ${
                isFeatured ? 'aspect-[1/1.1] md:aspect-auto md:h-full' : 'aspect-[4/5]'
              }`}
            >
              {/* Background — product image OR category-specific gradient */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : style.bg ? (
                <img
                  src={style.bg}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}

              {/* Gradient overlay — always present */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} mix-blend-multiply opacity-70 group-hover:opacity-60 transition-opacity`} />

              {/* Bottom dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top-left emoji badge */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4">
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl md:text-3xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  {style.emoji}
                </div>
              </div>

              {/* Top-right tag */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {style.tag}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className={`text-white font-extrabold drop-shadow-xl mb-1 ${isFeatured ? 'text-xl md:text-3xl' : 'text-base md:text-lg'}`}>
                  {cat.name}
                </h3>
                <div className="inline-flex items-center gap-1 text-white/90 text-xs font-semibold group-hover:gap-2 transition-all">
                  <span className="underline decoration-white/40 underline-offset-2">
                    Shop now
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/0 via-white/20 to-white/0 rotate-45 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { categories, products, loading, fetchCategories, fetchFeaturedProducts } = useProductStore();
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    // Fetch active homepage banners from admin
    api.get('/banners?placement=home-hero')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        setBanners(Array.isArray(payload) ? payload : []);
      })
      .catch(() => setBanners([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryList = Array.isArray(categories) ? categories : [];
  const productList = Array.isArray(products) ? products : [];
  // Use admin-configured banners; fall back to defaults if none
  const heroSlides = banners.length > 0 ? banners : FALLBACK_SLIDES;

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO CAROUSEL ===== */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-[420px] sm:h-[500px] md:h-[620px]"
        >
          {heroSlides.map((slide, idx) => {
            // Tailwind class maps
            const FIT_MAP = { cover: 'object-cover', contain: 'object-contain', fill: 'object-fill', none: 'object-none' };
            const POS_MAP = {
              center: 'object-center', top: 'object-top', bottom: 'object-bottom',
              left: 'object-left', right: 'object-right',
              'top-left': 'object-left-top', 'top-right': 'object-right-top',
              'bottom-left': 'object-left-bottom', 'bottom-right': 'object-right-bottom',
            };
            const TEXT_POS = {
              left: 'items-start text-left',
              center: 'items-center text-center',
              right: 'items-end text-right',
            };
            const fitClass = FIT_MAP[slide.imageFit] || 'object-cover';
            const posClass = POS_MAP[slide.imagePosition] || 'object-center';
            const textPosClass = TEXT_POS[slide.textPosition] || 'items-start text-left';
            const overlayOpacity = (slide.overlayOpacity ?? 40) / 100;

            return (
            <SwiperSlide key={slide._id || idx}>
              <div className={`relative h-full w-full bg-gradient-to-br ${slide.gradient || 'from-indigo-600 via-purple-500 to-pink-500'} overflow-hidden`}>
                {/* Background image if provided */}
                {slide.imageUrl && (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className={`absolute inset-0 w-full h-full ${fitClass} ${posClass}`}
                  />
                )}
                {/* Decorative shapes (only when no image) */}
                {!slide.imageUrl && (
                  <>
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22a%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M0 40V0h40%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.05%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23a)%22/%3E%3C/svg%3E')] opacity-40" />
                  </>
                )}
                {/* Dark overlay — opacity controlled by admin */}
                {slide.imageUrl && (
                  <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                )}

                <div className={`relative h-full max-w-7xl mx-auto px-5 md:px-12 flex flex-col justify-center ${textPosClass}`}>
                  <motion.div
                    key={slide.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`max-w-2xl text-white ${textPosClass}`}
                  >
                    {slide.subtitle && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-4 md:mb-6"
                      >
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {slide.subtitle}
                      </motion.div>
                    )}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-3 md:mb-4 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    {(slide.description || slide.desc) && (
                      <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/90 max-w-md drop-shadow">
                        {slide.description || slide.desc}
                      </p>
                    )}
                    <Link
                      to={slide.ctaLink || slide.link || '/shop'}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:bg-gray-100 transition-all hover:gap-3 shadow-lg text-sm sm:text-base"
                    >
                      {slide.ctaText || slide.cta || 'Shop Now'}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* ===== TRUST BADGES STRIP ===== */}
      <section className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FLASH SALE BANNER (if active) ===== */}
      <FlashSaleBanner />

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            ✨ Curated Collections
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Category</span>
          </h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">
            From everyday essentials to festive wear — find your perfect style
          </p>
        </motion.div>

        {categoryList.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <CategoryGrid categoryList={categoryList} />
        )}
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                Featured Products
              </h2>
            </div>
            <Link to="/shop" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : productList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productList.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No featured products yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* ===== WHOLESALE CTA BANNER ===== */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <motion.div
          {...fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6 sm:p-8 md:p-16"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                <Tag className="w-3.5 h-3.5" />
                For Resellers & Shop Owners
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
                Bulk buying?<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">
                  Save upto 60%
                </span>
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join our wholesale program — get tier-based pricing, exclusive catalog access, and MOQ discounts starting from just 10 pieces.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition"
                >
                  Wholesaler Login
                </Link>
              </div>
            </div>

            {/* Pricing preview card */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-4">
                  Sample Tier Pricing
                </p>
                <div className="space-y-3">
                  {[
                    { qty: '10-49 pcs', price: '₹550', color: 'bg-pink-500/20 text-pink-200' },
                    { qty: '50-99 pcs', price: '₹500', color: 'bg-purple-500/20 text-purple-200' },
                    { qty: '100+ pcs', price: '₹450', color: 'bg-emerald-500/20 text-emerald-200' },
                  ].map((tier) => (
                    <div key={tier.qty} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.color}`}>
                        {tier.qty}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {tier.price}<span className="text-sm text-white/50">/pc</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== TESTIMONIAL / STATS ===== */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '50K+', label: 'Happy Customers' },
              { num: '10K+', label: 'Products' },
              { num: '500+', label: 'Cities Served' },
              { num: '4.8★', label: 'Customer Rating' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.num}
                </p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
