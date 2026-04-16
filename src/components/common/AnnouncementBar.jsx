import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore';

const AnnouncementBar = () => {
  const { settings } = useSettingsStore();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem('ff_announcement_dismissed') === '1'
  );
  const [currentMsg, setCurrentMsg] = useState(0);

  const announcement = settings?.announcement;
  const messages = Array.isArray(announcement?.messages) ? announcement.messages.filter(Boolean) : [];

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMsg((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;
  if (!announcement?.enabled || messages.length === 0 || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ff_announcement_dismissed', '1');
  };

  const gradient = announcement.bgGradient || 'from-indigo-600 via-purple-600 to-pink-500';
  const textColor = announcement.textColor || 'text-white';
  const message = messages[currentMsg];

  return (
    <div className={`relative bg-gradient-to-r ${gradient} ${textColor} overflow-hidden`}>
      {/* Animated shimmer background */}
      <div className="absolute inset-0 bg-[length:20px_20px] bg-[linear-gradient(-45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] animate-stripe" />

      <Link
        to={announcement.link || '/shop'}
        className="relative block"
      >
        <div className="max-w-7xl mx-auto px-10 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 animate-pulse" />
          <span
            key={currentMsg}
            className="truncate animate-fade-in"
          >
            {message}
          </span>
        </div>
      </Link>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <style>{`
        @keyframes stripe {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .animate-stripe { animation: stripe 20s linear infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
