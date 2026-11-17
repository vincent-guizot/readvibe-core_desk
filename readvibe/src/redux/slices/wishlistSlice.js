import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_WISHLIST } from '../../constants';

const initialState = {
  items: INITIAL_WISHLIST,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const { bookId, priority = 'Medium', reason = '', referrer = '', isPublic = true } = action.payload;
      const exists = state.items.some((item) => item.bookId === bookId);
      if (!exists) {
        state.items.unshift({
          bookId,
          priority,
          reason,
          referrer,
          isPublic,
          addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
      }
    },
    removeFromWishlist: (state, action) => {
      const { bookId } = action.payload;
      state.items = state.items.filter((item) => item.bookId !== bookId);
    },
    toggleWishlist: (state, action) => {
      const { bookId, priority = 'Medium', reason = '' } = action.payload;
      const exists = state.items.some((item) => item.bookId === bookId);
      if (exists) {
        state.items = state.items.filter((item) => item.bookId !== bookId);
      } else {
        state.items.unshift({
          bookId,
          priority,
          reason,
          referrer: 'Reader Pick',
          isPublic: true,
          addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
      }
    },
    updateWishlistNote: (state, action) => {
      const { bookId, reason, priority } = action.payload;
      const item = state.items.find((it) => it.bookId === bookId);
      if (item) {
        if (reason !== undefined) item.reason = reason;
        if (priority !== undefined) item.priority = priority;
      }
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, updateWishlistNote } = wishlistSlice.actions;
export default wishlistSlice.reducer;
