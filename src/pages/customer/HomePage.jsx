import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import {
  Truck, Wallet, MapPin, ShieldCheck, ArrowRight, Sparkles,
  TrendingUp, Star, ChevronRight, Tag, Heart, Clock, X,
  ChevronDown, Award, Zap, Gift,
} from 'lucide-react';
import useProductStore from '../../store/productStore';
import api from '../../services/api';
import FlashSaleBanner from '../../components/common/FlashSaleBanner';
import { getRecentlyViewed, clearRecentlyViewed } from '../../utils/recentlyViewed';
import { FadeIn, SlideUp, Stagger, StaggerItem, AnimatedHeadline, CountUp, Tilt } from '../../components/common/Motion';
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
   RECENTLY VIEWED PRODUCT CARD — compact portrait card
   ============================================================ */
function RecentProductCard({ product, index = 0 }) {
  const price = product.retailPrice ?? 0;
  const mrp = product.retailMRP ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="flex-shrink-0 w-36 md:w-auto snap-start group"
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}

          {/* Clock badge — top right */}
          <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            <Clock className="w-3 h-3 text-purple-500" />
          </div>

          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
            />
          </div>

          {/* Info */}
          <div className="p-2.5">
            {product.category?.name && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-purple-500 mb-0.5 truncate">
                {product.category.name}
              </p>
            )}
            <p className="text-xs font-semibold text-gray-900 truncate leading-tight mb-1.5 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-gray-900">₹{price}</span>
              {discount > 0 && (
                <span className="text-[10px] text-gray-400 line-through">₹{mrp}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ============================================================
   CATEGORY GRID — clean cards, admin-uploaded images only
   ============================================================ */

// Tasteful fashion-toned gradients used when admin hasn't uploaded an image
const CAT_GRADIENTS = [
  'from-rose-700 to-pink-800',
  'from-violet-700 to-purple-900',
  'from-indigo-700 to-blue-900',
  'from-fuchsia-700 to-violet-900',
  'from-pink-700 to-rose-900',
  'from-purple-700 to-indigo-900',
  'from-teal-700 to-emerald-900',
  'from-amber-700 to-orange-900',
];

function CategoryGrid({ categoryList }) {
  // Only show categories with at least 1 product
  const visible = categoryList.filter((c) => (c.productCount ?? 0) > 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {visible.map((cat, i) => {
        const isFeatured = i === 0;
        const gradient = CAT_GRADIENTS[i % CAT_GRADIENTS.length];

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
              className={`group relative block overflow-hidden rounded-2xl md:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 ${
                isFeatured ? 'aspect-[1/1.1] md:aspect-auto md:h-full' : 'aspect-[4/5]'
              }`}
            >
              {/* Background: admin-uploaded image OR gradient */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.1s] ease-out"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              )}

              {/* Cinematic dark gradient at bottom for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              {/* Product count badge — top right */}
              {cat.productCount > 0 && (
                <div className="absolute top-3 right-3 md:top-4 md:right-4">
                  <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {cat.productCount} item{cat.productCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className={`text-white font-extrabold leading-tight drop-shadow mb-1.5 ${
                  isFeatured ? 'text-xl md:text-3xl' : 'text-base md:text-xl'
                }`}>
                  {cat.name}
                </h3>
                <div className="inline-flex items-center gap-1 text-white/80 text-xs font-semibold group-hover:gap-2.5 transition-all duration-200">
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Hover shine sweep */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl md:rounded-3xl">
                <div className="absolute -top-full -left-full w-[200%] h-[200%] bg-gradient-to-br from-white/0 via-white/10 to-white/0 rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-700" />
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
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    setRecentlyViewed(getRecentlyViewed());
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
                {/* Decorative floating blobs (only when no image) */}
                {!slide.imageUrl && (
                  <>
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float-slow" />
                    <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/10 animate-blob" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22a%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M0 40V0h40%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.05%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23a)%22/%3E%3C/svg%3E')] opacity-40" />
                  </>
                )}
                {/* Shimmer light sweep — adds gloss feel over any hero */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/0 via-white/5 to-white/0 mix-blend-overlay" />
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
                    <AnimatedHeadline
                      key={`h-${slide._id || idx}-${slide.title}`}
                      text={slide.title}
                      as="h1"
                      className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-3 md:mb-4 drop-shadow-lg"
                    />
                    {(slide.description || slide.desc) && (
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/90 max-w-md drop-shadow"
                      >
                        {slide.description || slide.desc}
                      </motion.p>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="flex items-center gap-4"
                    >
                      <Link
                        to={slide.ctaLink || slide.link || '/shop'}
                        className="btn-magnetic group inline-flex items-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold shadow-lg text-sm sm:text-base"
                      >
                        <Sparkles className="w-4 h-4 text-pink-500 group-hover:animate-wiggle" />
                        {slide.ctaText || slide.cta || 'Shop Now'}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Scroll-down indicator — subtle mouse-wheel hint under hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-white/80 pointer-events-none z-20"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/60 flex items-start justify-center p-1.5"
          >
            <span className="w-1 h-2 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TRUST BADGES STRIP ===== */}
      <section className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerChildren={0.12}>
            {trustBadges.map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="group flex items-center gap-3 p-2 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-md cursor-default">
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-brand-gradient group-hover:scale-110 group-hover:rotate-[-6deg]">
                    <Icon className="w-5 h-5 text-indigo-600 transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===== INFINITE MARQUEE — brand values ticker ===== */}
      <section className="bg-brand-gradient text-white overflow-hidden border-y border-white/10">
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {[...Array(2)].map((_, dupIdx) => (
            <div key={dupIdx} className="flex items-center gap-10 px-5 text-sm font-semibold uppercase tracking-widest">
              {[
                { icon: Gift, text: '100% Genuine Products' },
                { icon: Truck, text: 'Free Shipping Above ₹999' },
                { icon: Award, text: 'Handpicked Collections' },
                { icon: Zap, text: 'Flash Sales Every Week' },
                { icon: ShieldCheck, text: 'Secure COD Orders' },
                { icon: Sparkles, text: 'New Arrivals Daily' },
              ].map(({ icon: Icon, text }, i) => (
                <span key={`${dupIdx}-${i}`} className="inline-flex items-center gap-2 opacity-90">
                  <Icon className="w-4 h-4" />
                  {text}
                  <span className="ml-10 opacity-50">✦</span>
                </span>
              ))}
            </div>
          ))}
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
        ) : categoryList.filter((c) => (c.productCount ?? 0) > 0).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No categories with products yet.</p>
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

      {/* ===== RECENTLY VIEWED ===== */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-purple-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Your History
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                Recently Viewed
              </h2>
            </div>
            <button
              onClick={() => { clearRecentlyViewed(); setRecentlyViewed([]); }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </motion.div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="relative">
            {/* Mobile: horizontal scrollable row */}
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide md:hidden">
              {recentlyViewed.map((product, i) => (
                <RecentProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            {/* Desktop: grid (max 5 cols, max 10 items) */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 10).map((product, i) => (
                <RecentProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* ===== ANIMATED STATS ===== */}
      <section className="relative bg-gray-50 border-y border-gray-100 overflow-hidden">
        {/* Soft floating blobs behind stats */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-gradient opacity-10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-flash-gradient opacity-10 rounded-full blur-3xl animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" staggerChildren={0.12}>
            {[
              { end: 50000, suffix: '+', label: 'Happy Customers', icon: Heart },
              { end: 10000, suffix: '+', label: 'Products',        icon: Tag },
              { end: 500,   suffix: '+', label: 'Cities Served',   icon: MapPin },
              { end: 4.8,   suffix: '★', label: 'Customer Rating', icon: Star, float: true },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="group relative bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-5 hover-lift cursor-default">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-[-8deg] transition-transform duration-300">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-brand-gradient-anim">
                    {stat.float
                      ? <span>{stat.end}{stat.suffix}</span>
                      : <CountUp end={stat.end} suffix={stat.suffix} duration={1.8} />}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
