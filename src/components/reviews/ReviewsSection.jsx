import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, SlidersHorizontal } from 'lucide-react';
import useReviewStore from '../../store/reviewStore';
import ReviewSummary from './ReviewSummary';
import ReviewCard from './ReviewCard';
import Pagination from '../common/Pagination';

/**
 * Full reviews section for a product detail page.
 *
 * Props:
 *   productId — required
 */
export default function ReviewsSection({ productId }) {
  const {
    reviews, stats, loading, page, totalPages,
    fetchProductReviews, fetchStats, reset,
  } = useReviewStore();

  const [ratingFilter, setRatingFilter] = useState(null);
  const [sort, setSort] = useState('newest');
  const [withPhotos, setWithPhotos] = useState(false);

  useEffect(() => {
    reset();
    fetchStats(productId);
    fetchProductReviews(productId, { page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    fetchProductReviews(productId, { page: 1, rating: ratingFilter, sort, withPhotos });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingFilter, sort, withPhotos]);

  const handlePageChange = (newPage) => {
    fetchProductReviews(productId, { page: newPage, rating: ratingFilter, sort, withPhotos });
    window.scrollTo({ top: document.getElementById('reviews-top')?.offsetTop - 80 || 0, behavior: 'smooth' });
  };

  return (
    <section id="reviews-top" className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      </div>

      {/* No reviews yet */}
      {stats.total === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No reviews yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Be the first to review this product after your order is delivered.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <ReviewSummary
            stats={stats}
            activeFilter={ratingFilter}
            onFilterChange={setRatingFilter}
          />

          {/* Filter + Sort bar */}
          <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">Sort:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
              <option value="helpful">Most helpful</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-700 ml-2">
              <input
                type="checkbox"
                checked={withPhotos}
                onChange={(e) => setWithPhotos(e.target.checked)}
                className="rounded border-gray-300"
              />
              With photos only
            </label>

            {ratingFilter && (
              <span className="ml-auto text-xs text-gray-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                Showing {ratingFilter}-star reviews
              </span>
            )}
          </div>

          {/* Reviews list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500">No reviews match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  );
}
