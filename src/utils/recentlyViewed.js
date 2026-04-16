const KEY = 'ff_recently_viewed';
const MAX = 10;

/**
 * Pick only the fields needed to render a product card so
 * localStorage stays lean even with 10 products stored.
 */
function slim(product) {
  return {
    _id: product._id,
    slug: product.slug,
    name: product.name,
    images: product.images?.slice(0, 1) || [],
    retailPrice: product.retailPrice ?? product.price ?? 0,
    retailMRP: product.retailMRP ?? product.mrp ?? 0,
    category: product.category
      ? { name: product.category?.name || product.category }
      : null,
  };
}

export function addToRecentlyViewed(product) {
  if (!product?._id) return;
  try {
    const existing = getRecentlyViewed();
    // Remove duplicate if already present, then prepend
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated = [slim(product), ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private mode, quota)
  }
}

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
