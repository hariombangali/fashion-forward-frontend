import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Package, ChevronLeft, ChevronRight, X, Loader2,
  SlidersHorizontal, Box, Building2, Tag, Layers, TrendingUp, ShoppingBag,
  Sparkles, ArrowRight,
} from 'lucide-react';
import useProductStore from '../../store/productStore';
import useAuthStore from '../../store/authStore';
import WholesaleBulkOrderModal from './WholesaleBulkOrderModal';

const FABRIC_OPTIONS = ['Cotton', 'Silk', 'Polyester', 'Georgette', 'Chiffon', 'Rayon', 'Linen', 'Crepe'];

const WholesaleShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    wholesaleProducts,
    totalPages,
    currentPage,
    loading,
    fetchWholesaleProducts,
    categories,
    fetchCategories,
  } = useProductStore();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get('fabric') || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'wholesaler' && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = useCallback(() => {
    const params = { page: searchParams.get('page') || 1 };
    if (search.trim()) params.search = search.trim();
    if (selectedCategory) params.category = selectedCategory;
    if (selectedFabric) params.fabric = selectedFabric;
    fetchWholesaleProducts(params);
  }, [searchParams, search, selectedCategory, selectedFabric, fetchWholesaleProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.page) params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: search.trim(), page: '1' });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFabric('');
    setSearchParams({});
  };

  const goToPage = (page) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = search || selectedCategory || selectedFabric;
  const categoryList = Array.isArray(categories) ? categories : [];
  const productList = Array.isArray(wholesaleProducts) ? wholesaleProducts : [];
  const shopName = user?.businessDetails?.shopName || user?.name || 'Wholesaler';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ===== PREMIUM HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22b%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M0 40V0h40%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.05%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23b)%22/%3E%3C/svg%3E')]" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                B2B Wholesale Portal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 leading-tight">
                Welcome,<br className="sm:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">{shopName}</span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base md:text-lg">
                Exclusive tier pricing on our full catalog. MOQ starts from 10 pieces.
              </p>
            </div>

            <div className="flex gap-3">
              {[
                { icon: Layers, label: 'Products', value: productList.length },
                { icon: Tag, label: 'Best Tier', value: 'Upto 60% off' },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 md:flex-none bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:min-w-[130px]">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-white/70">{stat.label}</p>
                  <p className="text-sm sm:text-lg font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Search bar integrated in hero */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8 relative max-w-2xl"
          >
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 sm:pl-14 pr-24 sm:pr-32 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl text-gray-900 placeholder:text-gray-400 shadow-xl focus:ring-4 focus:ring-indigo-500/30 outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all text-sm"
            >
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* ===== FILTER CHIPS ===== */}
      <section className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            <button
              onClick={() => updateParams({ category: '', page: '1' }) || setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>

            {categoryList.slice(0, 8).map((cat) => (
              <button
                key={cat._id || cat.name}
                onClick={() => {
                  setSelectedCategory(cat.slug || cat.name);
                  updateParams({ category: cat.slug || cat.name, page: '1' });
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === (cat.slug || cat.name)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-2 text-red-600 text-sm font-medium hover:text-red-700 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" /> Filters
              </h3>

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-3">Fabric</p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedFabric('');
                      updateParams({ fabric: '', page: '1' });
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      !selectedFabric ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Fabrics
                  </button>
                  {FABRIC_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setSelectedFabric(f);
                        updateParams({ fabric: f, page: '1' });
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                        selectedFabric === f ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <Sparkles className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 mb-1">Bulk Discount</p>
                <p className="text-xs text-gray-600">Order 100+ pcs to unlock maximum tier savings</p>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{productList.length}</span> wholesale products
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-indigo-600 font-medium hover:text-indigo-700">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {productList.map((product, i) => (
                  <WholesaleProductCard key={product._id} product={product} index={i} onOrder={() => setSelectedProduct(product)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-9 h-9 rounded-lg font-medium text-sm transition ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-gray-400">…</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Fabric</p>
              <div className="space-y-1">
                {['', ...FABRIC_OPTIONS].map((f) => (
                  <button
                    key={f || 'all'}
                    onClick={() => {
                      setSelectedFabric(f);
                      updateParams({ fabric: f, page: '1' });
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedFabric === f ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {f || 'All Fabrics'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Order Modal */}
      {selectedProduct && (
        <WholesaleBulkOrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

/* ============================================================
   PREMIUM WHOLESALE PRODUCT CARD
   ============================================================ */
function WholesaleProductCard({ product, index, onOrder }) {
  const totalStock = product.totalStock ?? 0;
  const tiers = Array.isArray(product.wholesaleTiers) ? product.wholesaleTiers : [];
  const moq = product.wholesaleMOQ || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden transition-all"
    >
      {/* Image + MOQ Badge */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/600x450?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x450?text=No+Image'; }}
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          <Tag className="w-3 h-3" /> MOQ: {moq} pcs
        </div>
        <div className={`absolute top-3 right-3 backdrop-blur bg-white/90 text-xs font-semibold px-2.5 py-1 rounded-full ${
          totalStock > 50 ? 'text-green-700' : totalStock > 10 ? 'text-amber-700' : 'text-red-700'
        }`}>
          {totalStock} in stock
        </div>
      </div>

      <div className="p-5">
        {/* Category + SKU */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            {product.category?.name || 'Category'}
          </span>
          <span className="text-[10px] font-mono text-gray-400">{product.sku}</span>
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-1">
          {product.name}
        </h3>

        {/* Fabric + Sizes */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {product.fabric && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              {product.fabric}
            </span>
          )}
          {product.sizes?.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md font-medium">
              {s}
            </span>
          ))}
          {product.sizes?.length > 3 && (
            <span className="px-2 py-1 text-gray-400 text-xs">+{product.sizes.length - 3}</span>
          )}
        </div>

        {/* Tier Pricing Table */}
        {tiers.length > 0 ? (
          <div className="space-y-1.5 mb-4 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Tier Pricing
            </p>
            {tiers.map((tier, i) => {
              const colors = [
                'text-gray-900',
                'text-indigo-600',
                'text-emerald-600',
              ];
              const rangeLabel = tier.maxQty ? `${tier.minQty}-${tier.maxQty}` : `${tier.minQty}+`;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">{rangeLabel} pcs</span>
                  <span className={`font-bold ${colors[i] || colors[0]}`}>
                    ₹{tier.pricePerPiece}<span className="text-xs text-gray-400">/pc</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
            Contact admin for pricing
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onOrder}
          disabled={totalStock < moq}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalStock < moq ? 'Out of Stock' : 'Bulk Order'}
          {totalStock >= moq && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

export default WholesaleShopPage;
