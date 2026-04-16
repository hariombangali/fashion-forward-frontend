import { useState, useMemo } from 'react';
import { X, Package, AlertTriangle, ShoppingCart, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cartStore';

const WholesaleBulkOrderModal = ({ product, onClose }) => {
  const { addToCart, loading: cartLoading } = useCartStore();

  const sizes = product?.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product?.colors || [];
  const moq = product?.wholesaleMOQ || 10;
  const tiers = product?.wholesaleTiers || [];

  // Normalize: colors can be strings or objects {name, hex, images, _id}
  const colorOptions = colors.map((c) =>
    typeof c === 'string' ? { name: c, hex: null } : { name: c.name, hex: c.hex, _id: c._id }
  );

  const [quantities, setQuantities] = useState(
    sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]?.name || '');
  const [submitting, setSubmitting] = useState(false);

  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((sum, q) => sum + q, 0),
    [quantities]
  );

  const activeTier = useMemo(() => {
    if (!tiers.length || totalQuantity === 0) return null;
    const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
    return sorted.find((t) => totalQuantity >= t.minQty) || null;
  }, [tiers, totalQuantity]);

  const unitPrice = activeTier?.pricePerPiece || 0;
  const subtotal = totalQuantity * unitPrice;
  const meetsMOQ = totalQuantity >= moq;

  const updateQuantity = (size, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: Math.max(0, prev[size] + delta),
    }));
  };

  const handleInputChange = (size, value) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [size]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleAddToCart = async () => {
    if (!meetsMOQ) return;
    setSubmitting(true);
    try {
      const entries = Object.entries(quantities).filter(([, qty]) => qty > 0);
      for (const [size, qty] of entries) {
        await addToCart(product._id, size, selectedColor, qty);
      }
      toast.success(`Added ${totalQuantity} pcs to cart`);
      onClose();
    } catch {
      toast.error('Failed to add items to cart');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  const productImage =
    product.images?.[0] ||
    'https://placehold.co/120x120/e2e8f0/64748b?text=No+Image';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Order</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Product Info */}
          <div className="flex gap-4 items-start">
            <img
              src={productImage}
              alt={product.name}
              className="h-20 w-20 rounded-md object-cover border border-gray-200"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">SKU: {product.sku}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                <Package size={12} />
                MOQ: {moq} pcs
              </span>
            </div>
          </div>

          {/* Tier Pricing Reference */}
          {tiers.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Tier Pricing
              </p>
              <div className="space-y-1">
                {tiers.map((tier, i) => {
                  const isActive = activeTier && activeTier.minQty === tier.minQty;
                  return (
                    <div
                      key={i}
                      className={`flex justify-between text-sm rounded px-2 py-1 ${
                        isActive
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      <span>
                        {tier.minQty}
                        {tier.maxQty ? `-${tier.maxQty}` : '+'} pcs
                      </span>
                      <span>
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        }).format(tier.pricePerPiece)}
                        /pc
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colorOptions.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color._id || color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      selectedColor === color.name
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color.hex && (
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size-wise Quantity Matrix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size-wise Quantity
            </label>
            <div className="space-y-2">
              {sizes.map((size) => (
                <div
                  key={size}
                  className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                >
                  <span className="w-12 text-sm font-medium text-gray-700">
                    {size}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(size, -5)}
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
                      disabled={quantities[size] === 0}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantities[size]}
                      onChange={(e) => handleInputChange(size, e.target.value)}
                      className="h-8 w-20 rounded border border-gray-300 text-center text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    <button
                      onClick={() => updateQuantity(size, 5)}
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Quantity</span>
              <span className="font-medium text-gray-900">{totalQuantity} pcs</span>
            </div>
            {activeTier && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Tier</span>
                <span className="font-medium text-green-700">
                  {activeTier.minQty}
                  {activeTier.maxQty ? `-${activeTier.maxQty}` : '+'} pcs @{' '}
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(activeTier.pricePerPiece)}
                  /pc
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(subtotal)}
              </span>
            </div>
          </div>

          {/* MOQ Warning */}
          {totalQuantity > 0 && !meetsMOQ && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>
                Minimum order quantity is <strong>{moq} pcs</strong>. You need{' '}
                {moq - totalQuantity} more.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t bg-white px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!meetsMOQ || totalQuantity === 0 || submitting || cartLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
              {submitting ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleBulkOrderModal;
