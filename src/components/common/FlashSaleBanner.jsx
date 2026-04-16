import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore';

/**
 * Countdown Timer component — shows D:H:M:S remaining
 */
function Countdown({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-2 text-white">
      <Clock className="w-4 h-4" />
      <div className="flex items-center gap-1 font-mono font-bold">
        {timeLeft.days > 0 && (
          <>
            <TimeBlock value={timeLeft.days} label="D" />
            <span className="text-white/60">:</span>
          </>
        )}
        <TimeBlock value={timeLeft.hours} label="H" />
        <span className="text-white/60">:</span>
        <TimeBlock value={timeLeft.minutes} label="M" />
        <span className="text-white/60">:</span>
        <TimeBlock value={timeLeft.seconds} label="S" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur rounded px-2 py-1 min-w-[30px] text-center">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[8px] uppercase text-white/70 mt-0.5">{label}</span>
    </div>
  );
}

function getTimeLeft(endsAt) {
  if (!endsAt) return { expired: true };
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

/**
 * Full Flash Sale Banner — use on homepage
 */
export default function FlashSaleBanner() {
  const { settings } = useSettingsStore();
  const flashSale = settings?.flashSale;

  if (!flashSale?.enabled) return null;
  const endsAt = flashSale.endsAt;
  const { expired } = getTimeLeft(endsAt);
  if (expired) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="relative overflow-hidden rounded-2xl bg-flash-gradient p-5 md:p-8 shadow-xl">
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center animate-bounce-slow">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                ⚡ Flash Sale
              </p>
              <h3 className="text-white text-xl md:text-3xl font-extrabold drop-shadow">
                {flashSale.title}
              </h3>
              <p className="text-white/90 text-sm md:text-base">
                {flashSale.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Countdown endsAt={endsAt} />
            <Link
              to={flashSale.ctaLink || '/shop'}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-all hover:gap-3 shadow-lg"
            >
              {flashSale.ctaText || 'Shop Sale'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(-5deg); }
          }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        `}</style>
      </div>
    </section>
  );
}

export { Countdown };
