import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const MobileBottomNav = () => {
  const itemCount = useCartStore((s) => s.itemCount);
  const { user } = useAuthStore();
  const location = useLocation();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: LayoutGrid, label: 'Shop' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { to: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login' },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind fixed nav */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-5 h-16">
          {navItems.map(({ to, icon: Icon, label, badge }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-500'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
