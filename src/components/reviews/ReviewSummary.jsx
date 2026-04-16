import { Star } from 'lucide-react';
import ReviewStars from './ReviewStars';

/**
 * Displays aggregate review stats — average, total, star distribution bars.
 *
 * Props:
 *   stats — { average, total, distribution: { 5: n, 4: n, ... } }
 *   activeFilter — current star filter (number or null)
 *   onFilterChange — (rating: number|null) => void   // click a row to filter
 */
export default function ReviewSummary({ stats, activeFilter, onFilterChange }) {
  const { average = 0, total = 0, distribution = {} } = stats || {};
  const maxCount = Math.max(1, ...Object.values(distribution));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
      {/* Left — Average */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-6xl font-extrabold text-gray-900 leading-none">
          {average.toFixed(1)}
        </div>
        <ReviewStars rating={average} size="md" className="mt-2" />
        <p className="text-sm text-gray-600 mt-2">
          Based on <strong>{total}</strong> review{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Right — Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const isActive = activeFilter === star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onFilterChange?.(isActive ? null : star)}
              className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'bg-amber-100' : 'hover:bg-white/50'
              }`}
            >
              <span className="text-xs font-semibold text-gray-700 w-8 flex items-center gap-1">
                {star}<Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-10 text-right">{count}</span>
            </button>
          );
        })}
        {activeFilter != null && (
          <button
            onClick={() => onFilterChange?.(null)}
            className="text-xs text-indigo-600 hover:underline mt-1"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
