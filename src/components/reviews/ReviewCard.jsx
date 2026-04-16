import { useState } from 'react';
import { ThumbsUp, Trash2, CheckCircle2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewStars from './ReviewStars';
import useReviewStore from '../../store/reviewStore';
import useAuthStore from '../../store/authStore';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)   return `${d} days ago`;
  if (d < 30)  return `${Math.floor(d / 7)} weeks ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
}

export default function ReviewCard({ review, onDeleted }) {
  const { user } = useAuthStore();
  const { toggleHelpful, deleteReview } = useReviewStore();
  const [busy, setBusy] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const isOwner = user && review.user?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const authorName = review.user?.name || 'Anonymous';
  const initials = authorName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleHelpful = async () => {
    if (!user) {
      toast.error('Please login to mark reviews helpful');
      return;
    }
    setBusy(true);
    try {
      await toggleHelpful(review._id);
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return;
    setBusy(true);
    try {
      await deleteReview(review._id);
      toast.success('Review deleted');
      onDeleted?.(review._id);
    } catch (e) {
      toast.error('Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials || <UserIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{authorName}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ReviewStars rating={review.rating} size="xs" />
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{timeAgo(review.createdAt)}</span>
              </div>
            </div>
          </div>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete review"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        {review.title && (
          <h4 className="mt-3 font-semibold text-gray-900 text-base">{review.title}</h4>
        )}
        {review.comment && (
          <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {review.comment}
          </p>
        )}

        {/* Images */}
        {review.images?.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {review.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImg(img)}
                className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors"
              >
                <img src={img} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Footer — helpful */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleHelpful}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              review.markedHelpful
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${review.markedHelpful ? 'fill-current' : ''}`} />
            Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Review photo" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </>
  );
}
