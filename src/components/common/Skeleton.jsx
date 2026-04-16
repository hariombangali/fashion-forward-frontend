/**
 * Reusable skeleton loaders with shimmer effect.
 * Use instead of plain `animate-pulse` for a more premium feel.
 *
 * Variants:
 *   <SkeletonProductCard />
 *   <SkeletonText lines={3} />
 *   <SkeletonCircle size={40} />
 *   <SkeletonBox className="h-40 w-full" />
 */

export function SkeletonBox({ className = '' }) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div
      className={`shimmer-bg rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer-bg h-3 rounded"
          style={{ width: `${80 + Math.random() * 20}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="shimmer-bg aspect-[3/4]" />
      <div className="p-4 space-y-2.5">
        <div className="shimmer-bg h-3 w-20 rounded" />
        <div className="shimmer-bg h-4 w-3/4 rounded" />
        <div className="shimmer-bg h-5 w-24 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="shimmer-bg h-8 flex-1 rounded-md" />
          <div className="shimmer-bg h-8 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 8, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 md:gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
