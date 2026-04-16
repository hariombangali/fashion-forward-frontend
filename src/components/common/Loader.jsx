import { Loader2 } from 'lucide-react';

/* ================================================================
   FULL PAGE LOADER — Fashion Forward themed
   - Animated gradient ring
   - Branded "F" logo pulsing in center
   - Shimmering hanger icon above
   - Rotating tagline
   ================================================================ */
export const FullPageLoader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      {/* Hanger icon floating above */}
      <div className="mb-8 animate-bounce-slow">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#hangerGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-md"
        >
          <defs>
            <linearGradient id="hangerGrad" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {/* Hook */}
          <path d="M12 4a2 2 0 1 0-2 2" />
          {/* Hanger body */}
          <path d="M12 6v2l-8 5a1 1 0 0 0 .6 1.8h14.8A1 1 0 0 0 20 13l-8-5Z" />
        </svg>
      </div>

      {/* Gradient animated ring + logo */}
      <div className="relative w-24 h-24">
        {/* Outer rotating gradient ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 animate-spin-slow" />
        {/* Inner white circle */}
        <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
          {/* F logo with gradient */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl animate-pulse-subtle">
            <span className="text-white font-extrabold text-3xl tracking-tight">F</span>
          </div>
        </div>
        {/* Orbiting dot */}
        <div className="absolute inset-0 animate-spin-fast">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
        </div>
      </div>

      {/* Brand name */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
          Fashion Forward
        </h3>
        <p className="mt-1 text-xs text-gray-500 tracking-wider uppercase animate-fade-in-out">
          Curating your style
          <span className="inline-block ml-1 animate-dots">...</span>
        </p>
      </div>

      {/* Decorative thread/stitching line */}
      <div className="mt-6 flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{
              animation: `threadPulse 1.4s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>

    <style>{`
      @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes spin-fast {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
      @keyframes pulse-subtle {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes fade-in-out {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
      }
      @keyframes threadPulse {
        0%, 100% {
          transform: scale(0.6);
          opacity: 0.3;
        }
        50% {
          transform: scale(1);
          opacity: 1;
          background-color: #ec4899;
        }
      }
      .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      .animate-spin-fast { animation: spin-fast 2s linear infinite; }
      .animate-pulse-subtle { animation: pulse-subtle 1.8s ease-in-out infinite; }
      .animate-fade-in-out { animation: fade-in-out 2s ease-in-out infinite; }
    `}</style>
  </div>
);

/* ================================================================
   INLINE LOADER — compact spinner for buttons
   ================================================================ */
export const InlineLoader = ({ size = 4, className = '' }) => (
  <Loader2 className={`h-${size} w-${size} animate-spin ${className}`} />
);

/* ================================================================
   SKELETON — product card shimmer
   ================================================================ */
export const Skeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="relative h-64 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 rounded-full bg-gray-100" />
      <div className="h-4 w-3/4 rounded bg-gray-100" />
      <div className="flex items-baseline gap-2">
        <div className="h-5 w-16 rounded bg-gray-200" />
        <div className="h-3 w-12 rounded bg-gray-100" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 w-8 rounded bg-gray-100" />
        <div className="h-5 w-8 rounded bg-gray-100" />
        <div className="h-5 w-8 rounded bg-gray-100" />
      </div>
      <div className="h-9 w-full rounded-lg bg-gray-100" />
    </div>
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
      .animate-shimmer { animation: shimmer 1.5s infinite; }
    `}</style>
  </div>
);

/* ================================================================
   PAGE TRANSITION LOADER — thin top bar
   Shows briefly during navigation
   ================================================================ */
export const PageTransitionBar = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-progress-bar">
      <style>{`
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-bar { animation: progress-bar 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FullPageLoader;
