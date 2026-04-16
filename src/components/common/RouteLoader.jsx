import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Shows a thin gradient progress bar at the top of the page
 * whenever the route changes (similar to YouTube/GitHub nav loading).
 */
const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] overflow-hidden bg-indigo-100/40">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-route-progress" />
      </div>
      <style>{`
        @keyframes route-progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
        .animate-route-progress {
          animation: route-progress 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default RouteLoader;
