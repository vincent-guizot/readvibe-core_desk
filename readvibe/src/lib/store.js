"use client";

import { INITIAL_NOTIFICATIONS } from '../constants';
import { store } from '../redux/store';
import { loadReading, startReading, updateProgress, finishReading } from '../redux/slices/readingSlice';
import { loadWishlist, addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { updateUserProfile } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/uiSlice';
import http from '../services/http';
import { mapUser } from '../services/reader.api';

function getLocalItem(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function setLocalItem(key, value) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

export const readVibeStore = {
  syncWithVibeCore: async () => {
    if (!store.getState().auth.token) return;
    await Promise.all([store.dispatch(loadReading()), store.dispatch(loadWishlist())]);
  },
  getBooks: () => store.getState().books.items,
  getBookById: (id) => store.getState().books.items.find((book) => String(book.id) === String(id) || book.slug === id) || null,
  getCurrentReading: () => store.getState().reading.currentReading,
  getFinishedReads: () => store.getState().reading.finishedReads,
  updateReadingProgress: (bookId, currentPage, notes) => store.dispatch(updateProgress({ bookId, currentPage, notes })),
  startReadingBook: (bookId) => store.dispatch(startReading({ bookId })),
  markBookAsFinished: (payload) => store.dispatch(finishReading(payload)),
  getWishlist: () => store.getState().wishlist.items,
  addToWishlist: (payload) => store.dispatch(addToWishlist(payload)),
  removeFromWishlist: (bookId) => store.dispatch(removeFromWishlist({ bookId })),
  isInWishlist: (bookId) => store.getState().wishlist.items.some((item) => String(item.bookId) === String(bookId)),
  // Notifications
  getNotifications: () => {
    return getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
  },

  markNotificationAsRead: (id) => {
    const notifs = getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setLocalItem('readvibe_notifications', updated);
    return updated;
  },

  deleteNotification: (id) => {
    const notifs = getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.filter((n) => n.id !== id);
    setLocalItem('readvibe_notifications', updated);
    return updated;
  },

  clearAllNotifications: () => {
    setLocalItem('readvibe_notifications', []);
    return [];
  },

  markAllNotificationsRead: () => {
    const notifs = getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setLocalItem('readvibe_notifications', updated);
    return updated;
  },

  getUser: () => store.getState().auth.user,
  updateUser: async (updates) => {
    const current = store.getState().auth.user;
    const result = await http.put('/api/auth/profile', {
      fullname: updates.name ?? updates.fullname ?? current?.name,
      image: updates.avatar ?? updates.image ?? current?.avatar,
      username: updates.username ?? current?.username,
      bio: updates.bio ?? current?.bio ?? '',
      location: updates.location ?? current?.location ?? '',
    });
    const user = mapUser({ ...current, username: result.data.username ?? current?.username, profile: result.data.profile });
    store.dispatch(updateUserProfile(user));
    return user;
  },
  getReviewsForBook: async (bookId) => (await http.get(`/api/reviews/book/${bookId}`)).data,
  addReview: async ({ bookId, rating, mood, content, isSpoiler = false }) => {
    const result = await http.post('/api/reviews', { bookId, rating, moodTag: mood, publicReview: content, isSpoiler });
    await store.dispatch(loadReading());
    store.dispatch(addNotification({
      type: 'sparkle',
      title: 'Review Published ✨',
      description: `Your ${rating}★ reflection on the book was saved successfully.`,
      message: `Your ${rating}★ reflection on the book was saved successfully.`,
      link: `/books/${bookId}`,
      iconBg: '#E27D60',
    }));
    return result.data;
  },
};
export default readVibeStore;
