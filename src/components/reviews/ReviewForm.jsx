import { useState } from 'react';
import { X, Upload, Loader2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewStars from './ReviewStars';
import useReviewStore from '../../store/reviewStore';

/**
 * Modal form for submitting a product review.
 *
 * Props:
 *   productId — required
 *   orderId   — required (only delivered orders can review)
 *   productName — for display
 *   productImage — for display
 *   onClose — modal close callback
 *   onSuccess — called after successful submit
 */
export default function ReviewForm({ productId, orderId, productName, productImage, onClose, onSuccess }) {
  const { submitReview, submitting } = useReviewStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const limited = [...imageFiles, ...files].slice(0, 3);
    const previews = limited.map((f) => URL.createObjectURL(f));
    setImageFiles(limited);
    setImagePreviews(previews);
  };

  const removeImage = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }
    try {
      await submitReview({
        productId,
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        imageFiles,
      });
      toast.success('Review submitted! Thank you.');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Write a Review</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Product preview */}
          {productImage && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img src={productImage} alt={productName} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{productName}</p>
                <p className="text-xs text-gray-500">How would you rate this product?</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="text-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center">
              <ReviewStars rating={rating} size="lg" interactive onChange={setRating} />
            </div>
            <p className="mt-2 text-xs text-gray-500 h-4">
              {rating === 0 && 'Tap a star to rate'}
              {rating === 1 && '😞 Poor'}
              {rating === 2 && '😐 Fair'}
              {rating === 3 && '🙂 Good'}
              {rating === 4 && '😊 Very Good'}
              {rating === 5 && '🤩 Excellent'}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Review Title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Loved the fabric and fit!"
              maxLength={120}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Review <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Share details about fit, quality, delivery — anything that might help other customers."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/2000</p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Photos <span className="text-gray-400 font-normal">(up to 3)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imageFiles.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-500 mt-1">Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
