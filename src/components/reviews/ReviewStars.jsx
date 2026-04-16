import { Star } from 'lucide-react';

/**
 * Reusable star rating component.
 *
 * Props:
 *   rating     — number 0-5 (supports half stars visually in read mode)
 *   size       — 'xs' | 'sm' | 'md' | 'lg'
 *   interactive — allows clicking to set rating; pass onChange
 *   onChange   — (newRating: number) => void
 *   className  — wrapper classes
 */
export default function ReviewStars({
  rating = 0,
  size = 'sm',
  interactive = false,
  onChange,
  className = '',
}) {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };
  const starClass = sizeMap[size] || sizeMap.sm;

  const handleClick = (val) => {
    if (interactive && onChange) onChange(val);
  };

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;

        const fillClass = filled
          ? 'fill-amber-400 text-amber-400'
          : half
          ? 'fill-amber-400/50 text-amber-400'
          : 'fill-gray-200 text-gray-300';

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            aria-label={interactive ? `Rate ${i} star${i > 1 ? 's' : ''}` : undefined}
          >
            <Star className={`${starClass} ${fillClass}`} />
          </button>
        );
      })}
    </div>
  );
}
