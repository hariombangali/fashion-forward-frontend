import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, X, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useSettingsStore from '../../store/settingsStore';
import api from '../../services/api';

/**
 * FOMO — shows floating notifications of recent purchases
 * "Priya from Mumbai just bought Silk Saree"
 */
const LiveNotifications = () => {
  const { settings } = useSettingsStore();
  const location = useLocation();
  const [purchases, setPurchases] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('ff_live_notifs_dismissed') === '1'
  );
  const timeoutsRef = useRef([]);
  const indexRef = useRef(0);

  const enabled = settings?.liveNotifications?.enabled;

  // Fetch recent purchases once settings loaded
  useEffect(() => {
    if (!enabled || dismissed) return;
    api.get('/settings/live-purchases')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        setPurchases(Array.isArray(payload) ? payload : []);
      })
      .catch(() => {});
  }, [enabled, dismissed]);

  // Rotate notifications
  useEffect(() => {
    if (!enabled || dismissed || purchases.length === 0) return;
    if (location.pathname.startsWith('/admin')) return;

    const showNext = () => {
      const purchase = purchases[indexRef.current % purchases.length];
      indexRef.current += 1;
      setCurrent(purchase);
      setVisible(true);

      // Hide after 5 seconds
      const hideTimer = setTimeout(() => setVisible(false), 5000);
      timeoutsRef.current.push(hideTimer);

      // Show next after 12 seconds
      const nextTimer = setTimeout(showNext, 12000);
      timeoutsRef.current.push(nextTimer);
    };

    // First notification after 8 seconds
    const firstTimer = setTimeout(showNext, 8000);
    timeoutsRef.current.push(firstTimer);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [enabled, dismissed, purchases, location.pathname]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('ff_live_notifs_dismissed', '1');
  };

  if (!enabled || dismissed || !current || location.pathname.startsWith('/admin')) return null;

  const timeAgo = getTimeAgo(current.createdAt);

  return (
    <div
      className={`fixed bottom-20 md:bottom-5 left-3 md:left-5 z-40 max-w-xs transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-start gap-3 hover:shadow-xl transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-gray-900 leading-snug">
            {current.customerFirstName || 'Someone'}{' '}
            <span className="text-gray-500 font-normal">
              from
            </span>{' '}
            {current.city || 'India'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            just bought <span className="font-semibold text-indigo-600">{current.productName}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {timeAgo}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr) {
  if (!dateStr) return 'just now';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default LiveNotifications;
