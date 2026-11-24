import { createSlice } from '@reduxjs/toolkit';

const saveToLocalStorage = ({ notifications, notificationUserId }) => {
  if (typeof window !== 'undefined' && notificationUserId !== null) {
    try {
      localStorage.setItem(`readvibe_notifications:${notificationUserId}`, JSON.stringify(notifications));
    } catch {
      // ignore storage quota errors
    }
  }
};

const getAccountNotifications = (userId) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`readvibe_notifications:${userId}`);
      if (stored !== null) {
        const notifications = JSON.parse(stored);
        return Array.isArray(notifications) ? notifications : [];
      }
      return [{
        id: 'welcome-seed',
        type: 'sparkle',
        title: 'Welcome to ReadVibe! 🌿',
        description: 'Discover curated books by mood, track your reading journey, and create aesthetic story cards.',
        link: '/discover',
        read: false,
        time: 'Welcome',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: '#9B8CB4',
        iconColor: '#FFFFFF',
      }];
    } catch {
      // ignore
    }
  }
  return [];
};

const initialState = {
  notifications: [],
  notificationUserId: null,
  activeModal: null,
  modalData: null,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.activeModal = action.payload.modalName;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    addNotification: (state, action) => {
      if (state.notificationUserId === null) return;
      const payload = action.payload || {};
      const newNotif = {
        id: payload.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: payload.type || 'book',
        title: payload.title || 'New Notification',
        description: payload.description || payload.message || '',
        message: payload.message || payload.description || '',
        link: payload.link || '/my-reading',
        thumbnail: payload.thumbnail || '',
        read: false,
        time: payload.time || 'Just now',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: payload.iconBg || '#7A9A8B',
        iconColor: payload.iconColor || '#FFFFFF',
      };
      state.notifications.unshift(newNotif);
      saveToLocalStorage(state);
    },
    setNotifications: (state, action) => {
      if (state.notificationUserId === null) return;
      state.notifications = Array.isArray(action.payload) ? action.payload : [];
      saveToLocalStorage(state);
    },
    markNotificationRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
        saveToLocalStorage(state);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      saveToLocalStorage(state);
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      saveToLocalStorage(state);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      saveToLocalStorage(state);
    },
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        id: Date.now(),
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('auth/setCredentials', (state, { payload }) => {
      const userId = payload.token && payload.user?.id != null ? String(payload.user.id) : null;
      if (userId === state.notificationUserId) return;
      state.notificationUserId = userId;
      state.notifications = userId === null ? [] : getAccountNotifications(userId);
      saveToLocalStorage(state);
    });
    builder.addCase('auth/logout', () => initialState);

    // 1. Reading Journey Started Trigger
    builder.addCase('reading/startReading/fulfilled', (state, { payload }) => {
      if (state.notificationUserId === null) return;
      const bookTitle = payload?.book?.title || 'a new book';
      const notif = {
        id: `start-${payload?.bookId || Date.now()}-${Date.now()}`,
        type: 'book',
        title: 'Reading Journey Begun! 📖',
        description: `You started reading "${bookTitle}". Enjoy your chapter!`,
        message: `You started reading "${bookTitle}". Enjoy your chapter!`,
        link: `/reader/${payload?.bookId || ''}`,
        thumbnail: payload?.book?.coverUrl || '',
        read: false,
        time: 'Just now',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: '#7A9A8B',
        iconColor: '#FFFFFF',
      };
      state.notifications.unshift(notif);
      saveToLocalStorage(state);
    });

    // 2. Reading Milestone Trigger (Halfway / 50%)
    builder.addCase('reading/updateProgress/fulfilled', (state, { payload }) => {
      if (state.notificationUserId === null) return;
      const total = payload?.book?.pages || payload?.totalPages || 0;
      const current = payload?.currentPage || 0;
      if (total > 0 && current > 0) {
        const pct = Math.round((current / total) * 100);
        if (pct >= 50 && pct < 100) {
          const milestoneId = `milestone-50-${payload.bookId}`;
          if (!state.notifications.some((n) => n.id === milestoneId)) {
            const bookTitle = payload?.book?.title || 'your book';
            const notif = {
              id: milestoneId,
              type: 'recap',
              title: 'Halfway Milestone! 🌿',
              description: `You've passed 50% (${current} of ${total} pages) in "${bookTitle}".`,
              message: `You've passed 50% (${current} of ${total} pages) in "${bookTitle}".`,
              link: `/reader/${payload.bookId}`,
              thumbnail: payload?.book?.coverUrl || '',
              read: false,
              time: 'Just now',
              section: 'today',
              createdAt: new Date().toISOString(),
              iconBg: '#9B8CB4',
              iconColor: '#FFFFFF',
            };
            state.notifications.unshift(notif);
            saveToLocalStorage(state);
          }
        }
      }
    });

    // 3. Book Completed Trigger & Vibe Card Prompt
    builder.addCase('reading/finishReading/fulfilled', (state, { payload }) => {
      if (state.notificationUserId === null) return;
      const bookTitle = payload?.book?.title || 'your book';
      const notif = {
        id: `finish-${payload?.bookId || Date.now()}-${Date.now()}`,
        type: 'sparkle',
        title: 'Book Completed! 🎉',
        description: `Congratulations on finishing "${bookTitle}"! Turn it into a 9:16 Vibe Card to share.`,
        message: `Congratulations on finishing "${bookTitle}"! Turn it into a 9:16 Vibe Card to celebrate.`,
        link: `/vibe-card?bookId=${payload?.bookId || ''}`,
        thumbnail: payload?.book?.coverUrl || '',
        read: false,
        time: 'Just now',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: '#E27D60',
        iconColor: '#FFFFFF',
      };
      state.notifications.unshift(notif);
      saveToLocalStorage(state);
    });

    // 4. Saved to Wishlist Trigger
    builder.addCase('wishlist/addToWishlist/fulfilled', (state, { payload }) => {
      if (state.notificationUserId === null) return;
      const bookTitle = payload?.book?.title || 'Book';
      const priorityLabel = payload?.priority || 'Soon';
      const notif = {
        id: `wish-${payload?.bookId || Date.now()}-${Date.now()}`,
        type: 'bookmark',
        title: 'Saved to Wishlist ⭐',
        description: `"${bookTitle}" added to your wishlist (${priorityLabel} priority).`,
        message: `"${bookTitle}" added to your wishlist (${priorityLabel} priority).`,
        link: '/wishlist',
        thumbnail: payload?.book?.coverUrl || '',
        read: false,
        time: 'Just now',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: '#EAF3EC',
        iconColor: '#4A7C59',
      };
      state.notifications.unshift(notif);
      saveToLocalStorage(state);
    });

    // 5. Account Profile Updated Trigger
    builder.addCase('auth/updateUserProfile', (state) => {
      if (state.notificationUserId === null) return;
      const notif = {
        id: `profile-${Date.now()}`,
        type: 'shield',
        title: 'Profile Updated 👤',
        description: 'Your profile details and reading bio were updated successfully.',
        message: 'Your profile details and reading bio were updated successfully.',
        link: '/profile',
        read: false,
        time: 'Just now',
        section: 'today',
        createdAt: new Date().toISOString(),
        iconBg: '#7A5B87',
        iconColor: '#FFFFFF',
      };
      state.notifications.unshift(notif);
      saveToLocalStorage(state);
    });
  },
});

export const {
  openModal,
  closeModal,
  addNotification,
  setNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
