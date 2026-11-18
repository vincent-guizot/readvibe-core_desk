import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../../services/http';
import { mapReading, readingPayload, forCurrentSession } from '../../services/reader.api';

const findActivity = (state, bookId) => [...state.reading.currentReading, ...state.reading.finishedReads].find((item) => String(item.bookId) === String(bookId));
export const loadReading = createAsyncThunk('reading/load', forCurrentSession(async () => (await http.get('/api/reading')).data.map(mapReading)));
export const startReading = createAsyncThunk('reading/startReading', forCurrentSession(async ({ bookId }) => mapReading((await http.post('/api/reading/start', { bookId })).data)));
export const updateProgress = createAsyncThunk('reading/updateProgress', forCurrentSession(async ({ bookId, currentPage, notes }, { getState }) => {
  const activity = findActivity(getState(), bookId);
  if (!activity?.id) throw new Error('Mulai membaca buku terlebih dahulu.');
  return mapReading((await http.patch(`/api/reading/${activity.id}`, { currentPage: Number(currentPage), ...(notes !== undefined ? { privateNote: notes } : {}) })).data);
}));
export const finishReading = createAsyncThunk('reading/finishReading', forCurrentSession(async (data) => mapReading((await http.post('/api/reading/finish', { bookId: data.bookId, ...readingPayload(data) })).data)));
export const updateFinishedRead = createAsyncThunk('reading/updateFinishedRead', forCurrentSession(async (data, { getState }) => {
  const activity = findActivity(getState(), data.bookId);
  if (!activity?.id) throw new Error('Aktivitas membaca tidak ditemukan.');
  return mapReading((await http.patch(`/api/reading/${activity.id}`, readingPayload(data))).data);
}));
const deleteActivity = async ({ bookId }, { getState }) => {
  const activity = findActivity(getState(), bookId);
  if (!activity?.id) throw new Error('Aktivitas membaca tidak ditemukan.');
  await http.delete(`/api/reading/${activity.id}`);
  return bookId;
};
export const removeFinishedRead = createAsyncThunk('reading/removeFinishedRead', forCurrentSession(deleteActivity));
export const removeReading = createAsyncThunk('reading/removeReading', forCurrentSession(deleteActivity));

const initialState = { currentReading: [], finishedReads: [], status: 'idle', error: null };
const readingSlice = createSlice({
  name: 'reading', initialState, reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadReading.fulfilled, (state, action) => {
      state.currentReading = action.payload.filter((item) => item.status === 'Reading');
      state.finishedReads = action.payload.filter((item) => item.status === 'Finished');
    });
    for (const mutation of [startReading, updateProgress, finishReading, updateFinishedRead]) {
      builder.addCase(mutation.fulfilled, (state, { payload }) => {
        state.currentReading = state.currentReading.filter((item) => item.bookId !== payload.bookId);
        state.finishedReads = state.finishedReads.filter((item) => item.bookId !== payload.bookId);
        if (payload.status === 'Finished') state.finishedReads.unshift(payload);
        else if (payload.status === 'Reading') state.currentReading.unshift(payload);
      });
    }
    for (const mutation of [removeReading, removeFinishedRead]) {
      builder.addCase(mutation.fulfilled, (state, { payload }) => {
        state.currentReading = state.currentReading.filter((item) => String(item.bookId) !== String(payload));
        state.finishedReads = state.finishedReads.filter((item) => String(item.bookId) !== String(payload));
      });
    }
    builder.addCase('auth/logout', () => initialState);
    builder.addMatcher((action) => action.type.startsWith('reading/') && action.type.endsWith('/pending'), (state) => { state.error = null; state.status = 'loading'; });
    builder.addMatcher((action) => action.type.startsWith('reading/') && action.type.endsWith('/fulfilled'), (state) => { state.status = 'succeeded'; });
    builder.addMatcher((action) => action.type.startsWith('reading/') && action.type.endsWith('/rejected'), (state, action) => { state.error = action.error.message; state.status = 'failed'; });
  },
});
export default readingSlice.reducer;
