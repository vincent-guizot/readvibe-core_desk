import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_NOTIFICATIONS } from '../../constants';

const initialState = {
  notifications: INITIAL_NOTIFICATIONS,
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
    markNotificationRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
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
});

export const {
  openModal,
  closeModal,
  markNotificationRead,
  clearAllNotifications,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
