import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import useProductStore from '../../store/productStore';
import { SkeletonProductGrid } from '../../components/common/Skeleton';
import { Stagger, StaggerItem } from '../../components/common/Motion';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popular', value: 'popular' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLOR_OPTIONS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Grey', 'Brown', 'Navy'];
const FABRIC_OPTIONS = ['Cotton', 'Polyester', 'Silk', 'Linen', 'Denim', 'Wool', 'Rayon', 'Georgette'];

function ProductCard({ product }) {
  const price = product.retailPrice ?? product.price ?? 0;
  const mrp = product.retailMRP ?? product.mrp ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Link to={`/product/${product.slug || product._id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{product.category?.name || product.category}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-gray-900">₹{price}</span>
            {discount > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
                <span className="text-xs font-medium text-green-600">{discount}% off</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, totalPages, currentPage, loading, categories, fetchProducts, fetchCategories } = useProductStore();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from URL on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategories(cat.split(','));
  }, []);

  const searchQuery = searchParams.get('search') || '';

  const buildParams = useCallback(
    (page = 1) => {
      const params = { page, sort };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategories.length) params.category = selectedCategories.join(',');
      if (priceMin) params.minPrice = priceMin;
      if (priceMax) params.maxPrice = priceMax;
      if (selectedSizes.length) params.size = selectedSizes.join(',');
      if (selectedColors.length) params.color = selectedColors.join(',');
      if (selectedFabrics.length) params.fabric = selectedFabrics.join(',');
      return params;
    },
    [searchQuery, selectedCategories, priceMin, priceMax, selectedSizes, selectedColors, selectedFabrics, sort]
  );

  useEffect(() => {
    fetchProducts(buildParams(1));
  }, [sort, searchQuery, selectedCategories, selectedSizes, selectedColors, selectedFabrics, fetchProducts, buildParams]);

  const applyPriceFilter = () => {
    fetchProducts(buildParams(1));
  };

  const toggleFilter = (arr, setArr, value) => {
    setArr((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSort('newest');
  };

  const handlePageChange = (page) => {
    fetchProducts(buildParams(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = selectedCategories.length || priceMin || priceMax || selectedSizes.length || selectedColors.length || selectedFabrics.length;

  const FiltersContent = () => (
    <div>
      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 mb-4 font-medium">
          Clear all filters
        </button>
      )}

      <FilterSection title="Category">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(Array.isArray(categories) ? categories : []).map((cat) => (
            <label key={cat._id || cat.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug || cat.name)}
                onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat.slug || cat.name)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-2 w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition"
        >
          Apply
        </button>
      </FilterSection>

      <FilterSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 active:scale-90 ${
                selectedSizes.includes(size)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              onClick={() => toggleFilter(selectedColors, setSelectedColors, color)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 active:scale-90 ${
                selectedColors.includes(color)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fabric" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {FABRIC_OPTIONS.map((fabric) => (
            <button
              key={fabric}
              onClick={() => toggleFilter(selectedFabrics, setSelectedFabrics, fabric)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 active:scale-90 ${
                selectedFabrics.includes(fabric)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {fabric}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <p className="text-sm text-gray-500">
              {(Array.isArray(products) ? products : []).length} results
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-2">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Mobile filters overlay — animated slide-in */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-6 overflow-y-auto shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <FiltersContent />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <SkeletonProductGrid count={9} cols="grid-cols-2 md:grid-cols-3" />
            ) : !Array.isArray(products) || products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="inline-block text-6xl mb-4 animate-bounce-subtle">🔍</div>
                <p className="text-gray-500 text-lg">No products found.</p>
                <button onClick={clearFilters} className="mt-4 btn-magnetic bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium">
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <>
                <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-4" staggerChildren={0.05}>
                  {products.map((product) => (
                    <StaggerItem key={product._id} y={20}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </Stagger>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center items-center gap-2 mt-10"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 hover:border-indigo-400 transition active:scale-95"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .map((page, idx, arr) => (
                        <span key={page} className="relative">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`relative w-10 h-10 rounded-lg text-sm font-semibold transition-all active:scale-90 ${
                              page === currentPage
                                ? 'text-white'
                                : 'border border-gray-300 hover:border-indigo-400 hover:bg-gray-100'
                            }`}
                          >
                            {page === currentPage && (
                              <motion.span
                                layoutId="page-active"
                                className="absolute inset-0 rounded-lg bg-brand-gradient"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{page}</span>
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 hover:border-indigo-400 transition active:scale-95"
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
