import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, ShoppingCart, Minus, Plus, Star, Loader2, ChevronRight, Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useProductStore from '../../store/productStore';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { FullPageLoader } from '../../components/common/Loader';
import { addToRecentlyViewed } from '../../utils/recentlyViewed';

const TABS = ['Description', 'Size Guide', 'Reviews'];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentProduct: product, loading, fetchProductBySlug } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductBySlug(slug);
  }, [slug, fetchProductBySlug]);

  useEffect(() => {
    if (product?._id) {
      addToRecentlyViewed(product);
      api.get(`/products/${product._id}/related`).then(({ data }) => {
        const payload = data?.data || data;
        setRelatedProducts(Array.isArray(payload) ? payload : (payload?.products || []));
      }).catch(() => {});
    }
  }, [product?._id]);

  const isWholesaler = user?.role === 'wholesaler';

  const images = Array.isArray(product?.images) ? product.images : [];
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const colorsRaw = Array.isArray(product?.colors) ? product.colors : [];
  // Normalize colors: can be object {name, hex} or string
  const colors = colorsRaw.map(c => typeof c === 'object' ? c : { name: c, hex: c });
  const uniqueSizes = [...new Set(sizes)];
  const uniqueColors = colors.filter(c => c && c.name);

  // Product uses retailPrice / retailMRP (not price/mrp)
  const displayPrice = product?.retailPrice ?? product?.price ?? 0;
  const displayMRP = product?.retailMRP ?? product?.mrp ?? 0;
  const discount = displayMRP > displayPrice
    ? Math.round(((displayMRP - displayPrice) / displayMRP) * 100)
    : 0;

  // Stock is a Map: { size: qty }. Convert to object for easier access
  const stockObj = product?.stock && typeof product.stock === 'object' ? product.stock : {};
  const hasStockData = Object.keys(stockObj).length > 0;
  const isSizeOutOfStock = (size) => {
    // If no stock data at all, don't disable (legacy products)
    if (!hasStockData) return false;
    const qty = stockObj[size] ?? (typeof stockObj.get === 'function' ? stockObj.get(size) : 0) ?? 0;
    return qty <= 0;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    await addToCart(product._id, selectedSize || 'Free Size', selectedColor, quantity);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }
    try {
      // Backend toggle endpoint: POST /cart/wishlist/:productId
      const { data } = await api.post(`/cart/wishlist/${product._id}`);
      const isWishlisted = data?.data?.wishlisted ?? !wishlisted;
      setWishlisted(isWishlisted);
      toast.success(isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading || !product) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-indigo-600">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category?.slug || product.category}`} className="hover:text-indigo-600">
                {product.category?.name || product.category}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={images[selectedImage]?.url || images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-indigo-600' : 'border-transparent'
                  }`}
                >
                  <img src={img?.url || img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {(product.ratingsAvg > 0 || product.ratingsCount > 0) && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(product.ratingsAvg || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.ratingsCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            {isWholesaler && product.wholesaleTiers ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Wholesale Pricing</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Min Qty</th>
                        <th className="px-4 py-2 text-left">Max Qty</th>
                        <th className="px-4 py-2 text-left">Price/Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.wholesaleTiers.map((tier, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{tier.minQty}</td>
                          <td className="px-4 py-2">{tier.maxQty || 'No limit'}</td>
                          <td className="px-4 py-2 font-semibold">₹{tier.pricePerPiece}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{displayMRP}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm font-medium rounded">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Size selector */}
            {uniqueSizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const outOfStock = isSizeOutOfStock(size);
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                          selectedSize === size
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : outOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {uniqueColors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition ${
                        selectedColor === color.name
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                      }`}
                    >
                      <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hex || color.name }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Buy Now
              </button>
              <button
                onClick={toggleWishlist}
                className={`w-12 h-12 flex items-center justify-center border rounded-lg transition ${
                  wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Share via WhatsApp */}
            <button
              onClick={() => {
                const url = window.location.href;
                const text = `Check out this ${product.name} on Fashion Forward! ₹${displayPrice} ${displayMRP > displayPrice ? `(was ₹${displayMRP})` : ''}\n${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-lg font-medium hover:bg-green-100 transition border border-green-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Share on WhatsApp
            </button>

            {/* Delivery info */}
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <Truck className="w-4 h-4" />
              <span>Free delivery on orders above Rs. 999</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="py-6">
            {activeTab === 'Description' && (
              <div className="prose max-w-none text-gray-700">
                <p>{product.description || 'No description available.'}</p>
                {product.fabric && <p><strong>Fabric:</strong> {product.fabric}</p>}
                {product.pattern && <p><strong>Pattern:</strong> {product.pattern}</p>}
              </div>
            )}
            {activeTab === 'Size Guide' && (
              <div className="text-gray-700">
                <p className="mb-4">Refer to the size chart below for the best fit:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border text-left">Size</th>
                        <th className="px-4 py-2 border text-left">Chest (in)</th>
                        <th className="px-4 py-2 border text-left">Waist (in)</th>
                        <th className="px-4 py-2 border text-left">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'S', chest: '36', waist: '30', length: '27' },
                        { size: 'M', chest: '38', waist: '32', length: '28' },
                        { size: 'L', chest: '40', waist: '34', length: '29' },
                        { size: 'XL', chest: '42', waist: '36', length: '30' },
                        { size: 'XXL', chest: '44', waist: '38', length: '31' },
                      ].map((row) => (
                        <tr key={row.size} className="border-t">
                          <td className="px-4 py-2 border font-medium">{row.size}</td>
                          <td className="px-4 py-2 border">{row.chest}</td>
                          <td className="px-4 py-2 border">{row.waist}</td>
                          <td className="px-4 py-2 border">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((rp) => (
                <Link key={rp._id} to={`/product/${rp.slug || rp._id}`} className="group block">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                      <img
                        src={rp.images?.[0]?.url || rp.images?.[0] || '/placeholder.png'}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{rp.name}</h3>
                      <span className="text-sm font-bold text-gray-900">₹{rp.retailPrice ?? rp.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
