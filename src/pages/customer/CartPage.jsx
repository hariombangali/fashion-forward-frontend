import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { FullPageLoader } from '../../components/common/Loader';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, shippingCharge, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const isWholesaler = user?.role === 'wholesaler';

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && items.length === 0) {
    return <FullPageLoader />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-8">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                <Link to={`/product/${item.product?.slug || item.product?._id}`} className="flex-shrink-0">
                  <div className="w-24 h-28 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product?.image || item.product?.images?.[0] || 'https://via.placeholder.com/200?text=No+Image'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">{item.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      {isWholesaler && item.tierLabel && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                          {item.tierLabel}
                        </span>
                      )}
                      {isWholesaler && item.moqWarning && (
                        <p className="text-xs text-orange-600 mt-1">{item.moqWarning}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{item.subtotal ?? (item.pricePerPiece ?? 0) * item.quantity}</p>
                      <p className="text-xs text-gray-500">₹{item.pricePerPiece ?? item.product?.retailPrice ?? 0} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shippingCharge === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingCharge}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/shop" className="block text-center text-sm text-indigo-600 mt-3 hover:text-indigo-500">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
