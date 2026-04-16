import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
  ];

  if (user?.role === 'wholesaler') {
    navLinks.push({ label: 'Wholesale', to: '/wholesale' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between gap-3">
          {/* Logo — uses admin-uploaded logo if available, else gradient initial */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-9 md:h-10 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base md:text-lg">
                  {storeName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {!logoUrl && (
              <span className="text-base md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:inline">
                {storeName}
              </span>
            )}
          </Link>

          {/* Search bar — visible on ALL sizes, grows on desktop */}
          <form
            onSubmit={handleSearch}
            className="flex-1 md:mx-6 md:max-w-md"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist — desktop only (mobile uses bottom nav) */}
            <Link to="/wishlist" className="relative text-gray-700 hover:text-indigo-600 hidden md:block">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart — desktop only */}
            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 hidden md:block">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User dropdown — desktop only */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}

              {/* Dropdown menu */}
              {dropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
