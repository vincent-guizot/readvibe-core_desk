// readvibe/src/lib/store.js
'use client';

import {
  INITIAL_BOOKS,
  INITIAL_CURRENT_READING,
  INITIAL_FINISHED_READS,
  INITIAL_WISHLIST,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER,
  INITIAL_REVIEWS,
} from '../constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

async function apiFetch(path, options = {}) {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('readvibe_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.warn(`[VibeCore Sync] ${path} offline/network notice:`, err.message);
    return null;
  }
}

// Helper to safely get from localStorage
function getLocalItem(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalItem(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export const readVibeStore = {
  // Sync all live data from VibeCore
  syncWithVibeCore: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('readvibe_token');
    if (!token) return;

    try {
      // 1. Sync User Profile
      const meRes = await apiFetch('/api/auth/me');
      if (meRes?.data?.user) {
        const u = meRes.data.user;
        const current = getLocalItem('readvibe_user', INITIAL_USER);
        const merged = {
          ...current,
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.profile?.fullname || u.username,
          avatar: u.profile?.image || current.avatar,
        };
        setLocalItem('readvibe_user', merged);
      }

      // 2. Sync Reading Activities
      const readRes = await apiFetch('/api/reading');
      if (Array.isArray(readRes?.data)) {
        const serverActivities = readRes.data;
        const reading = serverActivities
          .filter((a) => a.status === 'Reading')
          .map((a) => ({
            id: a.id,
            bookId: a.book?.id || a.bookId,
            currentPage: a.currentPage || 1,
            totalPages: a.book?.page || 250,
            startedAt: new Date(a.startDate || a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            notes: a.privateNote || '',
            lastRead: 'Today',
            book: a.book,
          }));

        const finished = serverActivities
          .filter((a) => a.status === 'Finished')
          .map((a) => ({
            id: a.id,
            bookId: a.book?.id || a.bookId,
            finishedAt: new Date(a.finishDate || a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rating: a.rating || 5,
            favoriteQuote: a.quote || '',
            moods: a.moodTag ? [a.moodTag] : ['Cozy'],
            privateNotes: a.privateNote || '',
            vibeCardTheme: 'Paper',
            book: a.book,
          }));

        if (reading.length > 0) setLocalItem('readvibe_current_reading', reading);
        if (finished.length > 0) setLocalItem('readvibe_finished_reads', finished);
      }

      // 3. Sync Wishlist
      const wishRes = await apiFetch('/api/wishlist');
      if (Array.isArray(wishRes?.data)) {
        const items = wishRes.data.map((w) => ({
          id: w.id,
          bookId: w.book?.id || w.bookId,
          priority: w.priority || 'Medium',
          reason: w.reason || '',
          isPublic: w.visibility === 'Public',
          addedAt: new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          book: w.book,
        }));
        setLocalItem('readvibe_wishlist', items);
      }
    } catch (e) {
      console.warn('Sync with VibeCore error:', e);
    }
  },
  // Books
  getBooks: () => {
    return INITIAL_BOOKS;
  },

  getBookById: (id) => {
    return INITIAL_BOOKS.find((b) => b.id === id || b.slug === id) || INITIAL_BOOKS[0];
  },

  // Currently Reading
  getCurrentReading: () => {
    return getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
  },

  updateReadingProgress: (bookId, newPage, notes) => {
    const list = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    let targetItem = null;
    let found = false;
    const updated = list.map((item) => {
      if (item.bookId === bookId || item.id === bookId) {
        found = true;
        targetItem = {
          ...item,
          currentPage: Number(newPage),
          notes: notes !== undefined ? notes : item.notes,
          lastRead: 'Just now'
        };
        return targetItem;
      }
      return item;
    });

    if (!found) {
      const book = INITIAL_BOOKS.find((b) => b.id === bookId || b.slug === bookId);
      targetItem = {
        id: `reading-${Date.now()}`,
        bookId: book?.id || bookId,
        currentPage: Number(newPage),
        totalPages: book?.pages || 300,
        startedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: notes || '',
        lastRead: 'Just now'
      };
      updated.unshift(targetItem);
    }

    setLocalItem('readvibe_current_reading', updated);

    if (targetItem && targetItem.id && !targetItem.id.toString().startsWith('reading-')) {
      apiFetch(`/api/reading/${targetItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          privateNote: notes,
        }),
      });
    }

    return updated;
  },

  startReadingBook: (bookId) => {
    const list = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    const book = INITIAL_BOOKS.find((b) => b.id === bookId || b.slug === bookId);
    if (!list.some((item) => item.bookId === bookId)) {
      const newItem = {
        bookId: book?.id || bookId,
        currentPage: 1,
        totalPages: book?.pages || 250,
        startedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: '',
        lastRead: 'Today'
      };
      const updated = [newItem, ...list];
      setLocalItem('readvibe_current_reading', updated);
      
      // Remove from wishlist if it was there
      readVibeStore.removeFromWishlist(bookId);

      // Async sync with live VibeCore
      const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 1);
      apiFetch('/api/reading/start', {
        method: 'POST',
        body: JSON.stringify({ bookId: numericId }),
      }).then((res) => {
        if (res?.data?.id) {
          newItem.id = res.data.id;
          setLocalItem('readvibe_current_reading', [newItem, ...list]);
        }
      });

      return updated;
    }
    return list;
  },

  // Finished Reads
  getFinishedReads: () => {
    return getLocalItem('readvibe_finished_reads', INITIAL_FINISHED_READS);
  },

  markBookAsFinished: ({ bookId, rating = 5, favoriteQuote = '', moods = [], privateNotes = '', vibeCardTheme = 'Paper' }) => {
    // Remove from current reading
    const current = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    const updatedCurrent = current.filter((item) => item.bookId !== bookId);
    setLocalItem('readvibe_current_reading', updatedCurrent);

    // Add to finished reads
    const finished = getLocalItem('readvibe_finished_reads', INITIAL_FINISHED_READS);
    const newFinishedItem = {
      bookId,
      finishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: Number(rating),
      favoriteQuote,
      moods: moods.length > 0 ? moods : ['Cozy', 'Hopeful'],
      privateNotes,
      vibeCardTheme
    };
    const updatedFinished = [newFinishedItem, ...finished.filter((f) => f.bookId !== bookId)];
    setLocalItem('readvibe_finished_reads', updatedFinished);

    // Update user stats
    const user = readVibeStore.getUser();
    if (user && user.stats) {
      user.stats.finished = (user.stats.finished || 12) + 1;
      setLocalItem('readvibe_user', user);
    }

    // Async sync with live VibeCore
    const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 1);
    apiFetch('/api/reading/finish', {
      method: 'POST',
      body: JSON.stringify({
        bookId: numericId,
        rating: Number(rating),
        quote: favoriteQuote,
        publicReview: favoriteQuote || 'Selesai dibaca via ReadVibe.',
        privateNote: privateNotes,
        moodTag: moods.length > 0 ? moods[0] : 'Thoughtful',
      }),
    });

    return updatedFinished;
  },

  // Wishlist
  getWishlist: () => {
    return getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
  },

  addToWishlist: ({ bookId, priority = 'Medium', reason = '', referrer = '', isPublic = true }) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    const existingIndex = list.findIndex((w) => w.bookId === bookId);
    const entry = {
      bookId,
      priority,
      reason,
      referrer,
      isPublic,
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...list];
    }
    setLocalItem('readvibe_wishlist', updated);

    // Async sync with live VibeCore
    const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 2);
    apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({
        bookId: numericId,
        priority,
        reason,
        visibility: isPublic ? 'Public' : 'Private',
      }),
    }).then((res) => {
      if (res?.data?.id) {
        entry.id = res.data.id;
      }
    });

    return updated;
  },

  removeFromWishlist: (bookId) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    const itemToRemove = list.find((w) => w.bookId === bookId);
    const updated = list.filter((w) => w.bookId !== bookId);
    setLocalItem('readvibe_wishlist', updated);

    if (itemToRemove && itemToRemove.id) {
      apiFetch(`/api/wishlist/${itemToRemove.id}`, { method: 'DELETE' });
    }
    return updated;
  },

  isInWishlist: (bookId) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    return list.some((w) => w.bookId === bookId);
  },

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

  // User Profile
  getUser: () => {
    return getLocalItem('readvibe_user', INITIAL_USER);
  },

  updateUser: (updates) => {
    const current = getLocalItem('readvibe_user', INITIAL_USER);
    const updated = { ...current, ...updates };
    setLocalItem('readvibe_user', updated);

    apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        fullname: updates.name || updates.fullname || current.name,
        bio: updates.bio,
        location: updates.location,
        image: updates.avatar || updates.image
      }),
    }).catch(() => {});

    return updated;
  },

  // Reviews
  getReviewsForBook: (bookId) => {
    const all = getLocalItem('readvibe_reviews', INITIAL_REVIEWS);
    return all.filter((r) => r.bookId === bookId);
  },

  addReview: ({ bookId, rating, mood, content, isSpoiler = false }) => {
    const all = getLocalItem('readvibe_reviews', INITIAL_REVIEWS);
    const user = readVibeStore.getUser();
    const newRev = {
      id: `rev-${Date.now()}`,
      bookId,
      reviewerName: user.name || 'Vincent',
      reviewerUsername: user.username || 'vincent',
      reviewerAvatar: user.avatar,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      mood: mood || 'Cozy',
      content,
      helpfulCount: 0,
      isSpoiler
    };
    const updated = [newRev, ...all];
    setLocalItem('readvibe_reviews', updated);
    return updated;
  }
};

export default readVibeStore;
