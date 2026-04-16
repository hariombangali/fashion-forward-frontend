import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const ProductCard = ({ product, showWholesale = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);

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
  } = product || {};

  const discount =
    retailMRP && retailPrice && retailMRP > retailPrice
      ? Math.round(((retailMRP - retailPrice) / retailMRP) * 100)
      : 0;

  const thumbnail = images[0] || 'https://via.placeholder.com/400x400?text=No+Image';

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    // If there are size/color choices, direct to product page
    if (sizes.length > 1 || colors.length > 1) {
      navigate(`/product/${slug}`);
      return;
    }

    try {
      const size = sizes[0] || 'Free Size';
      const color = colors[0]?.name || '';
      await addToCart(_id, size, color, 1);
    } catch {
      // handled by store
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link to={`/product/${slug}`} className="block overflow-hidden">
        <img
          src={thumbnail}
          alt={name}
          className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
        />
      </Link>

      {/* Wishlist toggle */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted((prev) => !prev); }}
        className="absolute right-3 top-3 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110"
        aria-label="Add to wishlist"
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
      </button>

      {/* Discount badge */}
      {!showWholesale && discount > 0 && (
        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          -{discount}%
        </span>
      )}

      {/* Info */}
      <div className="p-4">
        {category && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-600">
            {typeof category === 'object' ? category.name : category}
          </p>
        )}

        <Link to={`/product/${slug}`}>
          <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-gray-900 hover:text-indigo-600">
            {name}
          </h3>
        </Link>

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
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {sizes.slice(0, 5).map((size) => (
              <span key={size} className="rounded border px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
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
                  className="inline-block h-4 w-4 rounded-full border border-gray-300"
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
            className="flex-1 rounded-md bg-indigo-600 py-2 text-center text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            View Details
          </Link>
          <button
            onClick={handleQuickAdd}
            className="rounded-md border border-indigo-600 p-2 text-indigo-600 transition hover:bg-indigo-50"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
