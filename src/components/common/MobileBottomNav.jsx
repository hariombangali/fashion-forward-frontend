import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const MobileBottomNav = () => {
  const itemCount = useCartStore((s) => s.itemCount);
  const { user } = useAuthStore();
  const location = useLocation();
  const prevCount = useRef(itemCount);
  const [bumpCart, setBumpCart] = useState(false);

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  // Bounce cart icon when count increases
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBumpCart(true);
      const t = setTimeout(() => setBumpCart(false), 700);
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: LayoutGrid, label: 'Shop' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount, bump: bumpCart },
    { to: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login' },
  ];

  return (
    <>
      {/* Spacer */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 h-16 relative">
          {navItems.map(({ to, icon: Icon, label, badge, bump }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center gap-1 group"
              >
                {/* Active pill background that slides with layout animation */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-x-3 top-1.5 bottom-1.5 rounded-xl bg-brand-gradient opacity-10"
                  />
                )}
                {/* Active top indicator with layout id */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute top-0 w-10 h-0.5 bg-brand-gradient rounded-full"
                  />
                )}

                <motion.div
                  animate={bump ? { scale: [1, 1.4, 1], rotate: [0, -10, 8, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-indigo-600 scale-110' : 'text-gray-500 group-active:scale-90'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <AnimatePresence>
                    {badge > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={bump ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-flash-gradient text-white text-[10px] font-bold shadow-md"
                      >
                        {badge > 99 ? '99+' : badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
