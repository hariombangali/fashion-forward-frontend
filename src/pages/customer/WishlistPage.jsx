import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart/wishlist');
      const payload = data?.data ?? data;
      setItems(Array.isArray(payload) ? payload : (payload?.wishlist || payload?.items || []));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.post(`/cart/wishlist/${productId}`);
      setItems((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to see your wishlist</h2>
          <Link to="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save your favorite products here for later.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          My Wishlist ({items.length} items)
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => {
            const price = product.retailPrice ?? product.price ?? 0;
            const mrp = product.retailMRP ?? product.mrp ?? 0;
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            return (
              <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden group relative">
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/product/${product.slug || product._id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">₹{price}</span>
                      {discount > 0 && (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
                          <span className="text-xs font-medium text-green-600">{discount}% off</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
