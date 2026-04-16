import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingCart, User, ChevronDown,
  LogOut, Package, LayoutDashboard, X, Menu,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useSettingsStore from '../../store/settingsStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const settings = useSettingsStore((s) => s.settings);
  const storeName = settings?.storeName || 'Fashion Forward';
  const logoUrl = settings?.logoUrl;
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestAbortRef = useRef(null);
  const prevCount = useRef(itemCount);

  // Bounce cart when count increases
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 700);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close overlays on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSuggestions([]);
    setSearchQuery('');
  }, [location.pathname]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Debounced live suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const timer = setTimeout(async () => {
      try {
        // cancel any in-flight request
        if (suggestAbortRef.current) suggestAbortRef.current.abort();
        const controller = new AbortController();
        suggestAbortRef.current = controller;
        const res = await fetch(
          `/api/products/suggest?q=${encodeURIComponent(searchQuery.trim())}&limit=8`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setSuggestions(json?.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Lock body scroll when mobile drawer or search is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSuggestions([]);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.slug || product._id}`);
    setSearchQuery('');
    setSuggestions([]);
    setSearchOpen(false);
  };

  const handleQuickSearch = (term) => {
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'New Arrivals', to: '/shop?sort=newest', badge: 'New' },
    { label: 'Shop', to: '/shop' },
  ];
  if (user?.role === 'wholesaler') {
    navLinks.push({ label: 'Wholesale', to: '/wholesale' });
  }

  const isActive = (to) => {
    const path = to.split('?')[0];
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const popularSearches = ['Dresses', 'Tops', 'Kurtas', 'Western Wear', 'Sale'];

  return (
    <>
      {/* ── Search Overlay ───────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Input row */}
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${suggestLoading ? 'text-indigo-400 animate-pulse' : 'text-indigo-500'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dresses, tops, kurtas…"
                className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="ml-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Live suggestions */}
            {suggestions.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {suggestions.map((product) => (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 transition-colors text-left group"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                          {product.name}
                        </p>
                        {product.category?.name && (
                          <p className="text-xs text-indigo-500 mt-0.5">
                            in {product.category.name}
                            {product.subCategory && ` › ${product.subCategory}`}
                          </p>
                        )}
                      </div>

                      {/* Arrow hint */}
                      <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                    </button>
                  </li>
                ))}

                {/* "See all results" footer */}
                <li>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full px-5 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                  >
                    See all results for &ldquo;{searchQuery}&rdquo; →
                  </button>
                </li>
              </ul>
            ) : (
              /* Popular searches fallback */
              <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center shadow">
                  <span className="text-white font-bold text-xs">{storeName.charAt(0)}</span>
                </div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                  {storeName}
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-3 py-3 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold mb-0.5 transition-all ${
                    isActive(link.to)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  <span className="uppercase tracking-wide">{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500 text-white uppercase tracking-wide">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="mt-3 border-t border-gray-100 pt-3 space-y-0.5">
                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-all">
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <Link to="/cart" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </nav>

            {/* Auth section */}
            <div className="px-4 py-4 border-t border-gray-100">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2.5 py-2 px-2 text-sm text-gray-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/my-orders" className="flex items-center gap-2.5 py-2 px-2 text-sm text-gray-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2.5 py-2 px-2 text-sm text-gray-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full py-2 px-2 mt-2 text-sm text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition shadow-md shadow-indigo-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Navbar ───────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'shadow-lg shadow-gray-200/60' : ''
        }`}
      >
        {/* Gradient accent line */}
        <div className="h-[3px] bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-[68px] items-center justify-between gap-4">

            {/* ── Logo ──────────────────────────────────────────── */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-10 w-auto object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200/60">
                  <span className="text-white font-extrabold text-lg leading-none">
                    {storeName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {!logoUrl && (
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {storeName}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-gray-400 font-semibold -mt-0.5">
                    Fashion &amp; Style
                  </span>
                </div>
              )}
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-7 lg:gap-9">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 group py-1 ${
                    isActive(link.to)
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 inline-block">
                    {link.label}
                  </span>
                  {link.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-flash-gradient text-white uppercase tracking-wide leading-none animate-bounce-subtle"
                    >
                      {link.badge}
                    </motion.span>
                  )}
                  {/* Sliding underline — shared across active links via layoutId */}
                  {isActive(link.to) && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-brand-gradient"
                    />
                  )}
                  {/* Hover underline grows from left */}
                  {!isActive(link.to) && (
                    <span className="absolute -bottom-1 left-0 h-[2px] rounded-full bg-brand-gradient w-0 group-hover:w-full transition-all duration-300 ease-out" />
                  )}
                </Link>
              ))}
            </div>

            {/* ── Right Icons ───────────────────────────────────── */}
            <div className="flex items-center gap-0.5 sm:gap-1">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Hamburger — mobile only, right side */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2.5 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Wishlist — desktop */}
              <Link
                to="/wishlist"
                className="p-2.5 rounded-full text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-all duration-200 hidden md:flex items-center"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart — desktop only (mobile uses bottom nav) */}
              <Link
                to="/cart"
                className="hidden md:flex p-2.5 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 relative"
                aria-label="Cart"
              >
                <motion.span
                  animate={cartBump ? { scale: [1, 1.4, 1], rotate: [0, -12, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.span>
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0 }}
                      animate={cartBump ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient text-[9px] font-extrabold text-white shadow ring-2 ring-white"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User dropdown — desktop */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-1.5 ml-1 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hidden lg:inline max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="ml-1 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition shadow-md shadow-indigo-200 hover:shadow-indigo-300"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                )}

                {/* Dropdown menu */}
                {dropdownOpen && user && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white shadow-xl shadow-gray-200/80 ring-1 ring-black/5 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3.5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile: login icon if not logged in */}
              {!user && (
                <Link
                  to="/login"
                  className="md:hidden p-2.5 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
