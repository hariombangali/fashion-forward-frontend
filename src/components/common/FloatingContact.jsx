import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Phone, X } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore';

/**
 * Floating bottom-right button on mobile — opens WhatsApp or Call
 */
const FloatingContact = () => {
  const { settings } = useSettingsStore();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Hide on admin, auth, checkout pages
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/checkout')
  ) return null;

  const whatsapp = settings?.contact?.whatsapp;
  const phone = settings?.contact?.phone;

  if (!whatsapp && !phone) return null;

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        "Hi, I'm interested in your products!"
      )}`
    : null;
  const phoneLink = phone ? `tel:${phone.replace(/\s/g, '')}` : null;

  return (
    <div className="fixed right-4 bottom-24 md:bottom-6 z-30 flex flex-col items-end gap-2">
      {/* Expanded options */}
      {open && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-full shadow-xl px-4 py-2.5 hover:scale-105 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">WhatsApp</span>
            </a>
          )}
          {phoneLink && (
            <a
              href={phoneLink}
              className="flex items-center gap-3 bg-white rounded-full shadow-xl px-4 py-2.5 hover:scale-105 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Call Us</span>
            </a>
          )}
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close contact menu' : 'Open contact menu'}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-800 rotate-180'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse-ring'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" fill="white" />
        )}
      </button>

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FloatingContact;
