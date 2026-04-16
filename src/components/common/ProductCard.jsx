import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import ReviewStars from '../reviews/ReviewStars';
import { Tilt } from './Motion';

const ProductCard = ({ product, showWholesale = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [burst, setBurst] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [quickAdded, setQuickAdded] = useState(false);

  const {
    _id,
    name,
    slug,
    images = [],
    category,
    retailPrice,
    retailMRP,
    wholesaleTiers = [],
    sizes = [],
    colors = [],
    ratingsAvg = 0,
    ratingsCount = 0,
  } = product || {};

  const discount =
    retailMRP && retailPrice && retailMRP > retailPrice
      ? Math.round(((retailMRP - retailPrice) / retailMRP) * 100)
      : 0;

  // Images may be URL strings or { url } objects — normalize
  const imageUrls = images
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  const primary = imageUrls[0] || 'https://via.placeholder.com/400x400?text=No+Image';
  const secondary = imageUrls[1] || primary;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (sizes.length > 1 || colors.length > 1) {
      navigate(`/product/${slug}`);
      return;
    }

    try {
      const size = sizes[0] || 'Free Size';
      const color = colors[0]?.name || '';
      await addToCart(_id, size, color, 1);
      setQuickAdded(true);
      setTimeout(() => setQuickAdded(false), 1400);
    } catch {
      // handled by store
    }
  };

  return (
    <Tilt max={6} className="group relative rounded-lg">
      <div
        className="relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
        onMouseEnter={() => imageUrls.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        {/* Image with crossfade */}
        <Link to={`/product/${slug}`} className="block overflow-hidden relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={primary}
            alt={name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${imgIdx === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
          />
          <img
            src={secondary}
            alt={name}
            loading="lazy"
            aria-hidden={imgIdx === 0}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${imgIdx === 1 ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            onError={(e) => { e.target.src = primary; }}
          />

          {/* Shimmer sweep on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-full -left-full w-[200%] h-[200%] bg-gradient-to-br from-white/0 via-white/20 to-white/0 rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-out" />
          </div>

          {/* Quick View overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 py-3 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </span>
          </div>
        </Link>

        {/* Wishlist toggle — with burst particles */}
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 rounded-full bg-white/95 backdrop-blur p-2 shadow-md z-10 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Add to wishlist"
        >
          <motion.span
            key={wishlisted ? 'on' : 'off'}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-block"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`}
            />
          </motion.span>
          {/* Burst particles */}
          <AnimatePresence>
            {burst && wishlisted && (
              <>
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const dx = Math.cos(angle) * 22;
                  const dy = Math.sin(angle) * 22;
                  return (
                    <motion.span
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                      animate={{ x: dx, y: dy, opacity: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500 pointer-events-none"
                    />
                  );
                })}
              </>
            )}
          </AnimatePresence>
        </button>

        {/* Discount badge */}
        {!showWholesale && discount > 0 && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="absolute left-3 top-3 rounded-full bg-flash-gradient px-2.5 py-1 text-[10px] font-bold text-white shadow-md z-10 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            -{discount}%
          </motion.span>
        )}

        {/* Info */}
        <div className="p-4">
          {category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-600">
              {typeof category === 'object' ? category.name : category}
            </p>
          )}

          <Link to={`/product/${slug}`}>
            <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Rating */}
          {ratingsCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <ReviewStars rating={ratingsAvg} size="xs" />
              <span className="text-xs text-gray-500">({ratingsCount})</span>
            </div>
          )}

          {/* Price section */}
          {showWholesale && wholesaleTiers.length > 0 ? (
            <div className="mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-1 font-medium">Qty</th>
                    <th className="pb-1 font-medium">Price/pc</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesaleTiers.map((tier, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1 text-gray-700">
                        {tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'} pcs
                      </td>
                      <td className="py-1 font-semibold text-gray-900">
                        ₹{tier.pricePerPiece}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">₹{retailPrice}</span>
              {retailMRP && retailMRP > retailPrice && (
                <span className="text-sm text-gray-400 line-through">₹{retailMRP}</span>
              )}
              {discount > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  Save ₹{retailMRP - retailPrice}
                </span>
              )}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {sizes.slice(0, 5).map((size) => (
                <span key={size} className="rounded border px-1.5 py-0.5 text-[10px] font-medium text-gray-600 transition-colors hover:border-indigo-500 hover:text-indigo-600">
                  {size}
                </span>
              ))}
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-3 flex gap-1.5">
              {colors.slice(0, 5).map((color, idx) => {
                const colorObj = typeof color === 'object' ? color : { name: color, hex: color };
                return (
                  <span
                    key={colorObj.name + idx}
                    title={colorObj.name}
                    className="inline-block h-4 w-4 rounded-full border border-gray-300 transition-transform hover:scale-125"
                    style={{ backgroundColor: colorObj.hex || colorObj.name }}
                  />
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/product/${slug}`}
              className="btn-magnetic flex-1 rounded-md bg-indigo-600 py-2 text-center text-xs font-semibold text-white"
            >
              View Details
            </Link>
            <button
              onClick={handleQuickAdd}
              className="relative rounded-md border border-indigo-600 p-2 text-indigo-600 transition-all duration-300 hover:bg-indigo-600 hover:text-white active:scale-95 overflow-hidden"
              aria-label="Add to cart"
            >
              <AnimatePresence mode="wait">
                {quickAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="block"
                  >
                    ✓
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="block"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

export default ProductCard;
