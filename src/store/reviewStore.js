import { create } from 'zustand';
import api from '../services/api';

const unwrap = (res) => res.data?.data ?? res.data;

const useReviewStore = create((set, get) => ({
  reviews: [],
  stats: { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
  loading: false,
  submitting: false,
  page: 1,
  totalPages: 1,
  myReviews: [],
  reviewable: [],

  /** Fetch paginated reviews for a product, with optional filters */
  fetchProductReviews: async (productId, { page = 1, rating, sort = 'newest', withPhotos = false } = {}) => {
    try {
      set({ loading: true });
      const params = { page, limit: 10, sort };
      if (rating) params.rating = rating;
      if (withPhotos) params.withPhotos = true;
      const res = await api.get(`/reviews/product/${productId}`, { params });
      const data = unwrap(res);
      set({
        reviews: data.reviews,
        page: data.page,
        totalPages: data.totalPages,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  /** Fetch aggregate rating stats */
  fetchStats: async (productId) => {
    try {
      const res = await api.get(`/reviews/stats/${productId}`);
      const stats = unwrap(res);
      set({ stats });
      return stats;
    } catch (err) {
      console.error('Failed to fetch review stats', err);
    }
  },

  /** Submit a new review (with optional image files) */
  submitReview: async ({ productId, orderId, rating, title, comment, imageFiles = [] }) => {
    try {
      set({ submitting: true });
      const fd = new FormData();
      fd.append('productId', productId);
      fd.append('orderId', orderId);
      fd.append('rating', rating);
      if (title)   fd.append('title', title);
      if (comment) fd.append('comment', comment);
      imageFiles.forEach((f) => fd.append('images', f));

      const res = await api.post('/reviews', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ submitting: false });
      // Refresh stats after submit
      await get().fetchStats(productId);
      return unwrap(res);
    } catch (err) {
      set({ submitting: false });
      throw err;
    }
  },

  /** Toggle helpful vote */
  toggleHelpful: async (reviewId) => {
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      const { helpfulCount, markedHelpful } = unwrap(res);
      // Update local state
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount, markedHelpful } : r
        ),
      }));
      return { helpfulCount, markedHelpful };
    } catch (err) {
      throw err;
    }
  },

  /** Delete own review */
  deleteReview: async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    set((state) => ({
      reviews: state.reviews.filter((r) => r._id !== reviewId),
      myReviews: state.myReviews.filter((r) => r._id !== reviewId),
    }));
  },

  /** Fetch my reviews */
  fetchMyReviews: async () => {
    const res = await api.get('/reviews/mine');
    const data = unwrap(res);
    set({ myReviews: data });
    return data;
  },

  /** Fetch products I can review (delivered & not yet reviewed) */
  fetchReviewable: async () => {
    const res = await api.get('/reviews/reviewable');
    const data = unwrap(res);
    set({ reviewable: data });
    return data;
  },

  /** Clear review state (on product change) */
  reset: () => set({
    reviews: [],
    stats: { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    page: 1,
    totalPages: 1,
  }),
}));

export default useReviewStore;
export { useReviewStore };
