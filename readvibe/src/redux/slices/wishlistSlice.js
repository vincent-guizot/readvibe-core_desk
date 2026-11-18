import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../../services/http';
import { mapWishlist, wishlistPayload, forCurrentSession } from '../../services/reader.api';

export const loadWishlist = createAsyncThunk('wishlist/load', forCurrentSession(async () => (await http.get('/api/wishlists')).data.map(mapWishlist)));
const findItem = (state, bookId) => state.wishlist.items.find((item) => String(item.bookId) === String(bookId));
export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', forCurrentSession(async (data, { getState }) => {
  const existing = findItem(getState(), data.bookId);
  const payload = wishlistPayload(data);
  const response = existing ? await http.put(`/api/wishlists/${existing.id}`, payload) : await http.post('/api/wishlists', payload);
  return mapWishlist({ ...existing, ...response.data });
}));
export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', forCurrentSession(async ({ bookId }, { getState }) => {
  const item = findItem(getState(), bookId);
  if (!item) return bookId;
  await http.delete(`/api/wishlists/${item.id}`);
  return bookId;
}));
export const toggleWishlist = ({ bookId, ...data }) => (dispatch, getState) => dispatch(findItem(getState(), bookId) ? removeFromWishlist({ bookId }) : addToWishlist({ bookId, ...data }));
export const updateWishlistNote = (data) => (dispatch) => dispatch(addToWishlist(data));

const initialState = { items: [], status: 'idle', error: null };
const wishlistSlice = createSlice({
  name: 'wishlist', initialState, reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadWishlist.fulfilled, (state, action) => { state.items = action.payload; });
    builder.addCase(addToWishlist.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((item) => item.bookId !== payload.bookId);
      state.items.unshift(payload);
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, { payload }) => { state.items = state.items.filter((item) => String(item.bookId) !== String(payload)); });
    for (const action of ['reading/startReading/fulfilled', 'reading/finishReading/fulfilled']) {
      builder.addCase(action, (state, { payload }) => { state.items = state.items.filter((item) => item.bookId !== payload.bookId); });
    }
    builder.addCase('auth/logout', () => initialState);
    builder.addMatcher((action) => action.type.startsWith('wishlist/') && action.type.endsWith('/pending'), (state) => { state.error = null; state.status = 'loading'; });
    builder.addMatcher((action) => action.type.startsWith('wishlist/') && action.type.endsWith('/fulfilled'), (state) => { state.status = 'succeeded'; });
    builder.addMatcher((action) => action.type.startsWith('wishlist/') && action.type.endsWith('/rejected'), (state, action) => { state.error = action.error.message; state.status = 'failed'; });
  },
});
export default wishlistSlice.reducer;
