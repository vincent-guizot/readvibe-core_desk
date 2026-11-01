import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_CURRENT_READING, INITIAL_FINISHED_READS } from '../../constants';

const initialState = {
  currentReading: INITIAL_CURRENT_READING,
  finishedReads: INITIAL_FINISHED_READS,
};

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    startReading: (state, action) => {
      const { bookId, totalPages = 300 } = action.payload;
      const existing = state.currentReading.find((item) => item.bookId === bookId);
      if (!existing) {
        state.currentReading.unshift({
          bookId,
          currentPage: 0,
          totalPages,
          startedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          notes: '',
          lastRead: 'Just now',
        });
      }
    },
    updateProgress: (state, action) => {
      const { bookId, currentPage, notes } = action.payload;
      const index = state.currentReading.findIndex((item) => item.bookId === bookId);
      if (index !== -1) {
        state.currentReading[index].currentPage = Number(currentPage);
        if (notes !== undefined) {
          state.currentReading[index].notes = notes;
        }
        state.currentReading[index].lastRead = 'Just now';
      }
    },
    finishReading: (state, action) => {
      const { bookId, rating = 5, favoriteQuote = '', moods = [], privateNotes = '', vibeCardTheme = 'Paper' } = action.payload;
      // Remove from currentReading
      state.currentReading = state.currentReading.filter((item) => item.bookId !== bookId);
      // Add or update in finishedReads
      const existingIndex = state.finishedReads.findIndex((item) => item.bookId === bookId);
      const finishedEntry = {
        bookId,
        finishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rating,
        favoriteQuote,
        moods,
        privateNotes,
        vibeCardTheme,
      };

      if (existingIndex !== -1) {
        state.finishedReads[existingIndex] = {
          ...state.finishedReads[existingIndex],
          ...finishedEntry,
          finishedAt: state.finishedReads[existingIndex].finishedAt || finishedEntry.finishedAt,
        };
      } else {
        state.finishedReads.unshift(finishedEntry);
      }
    },
    updateFinishedRead: (state, action) => {
      const {
        bookId,
        rating,
        reviewTitle,
        reviewContent,
        favoriteQuote,
        moods,
        privateNotes,
        vibeCardTheme,
        containsSpoilers,
        visibility,
      } = action.payload;

      const existingIndex = state.finishedReads.findIndex((item) => item.bookId === bookId);
      if (existingIndex !== -1) {
        state.finishedReads[existingIndex] = {
          ...state.finishedReads[existingIndex],
          ...(rating !== undefined && { rating: Number(rating) }),
          ...(reviewTitle !== undefined && { reviewTitle }),
          ...(reviewContent !== undefined && { reviewContent }),
          ...(favoriteQuote !== undefined && { favoriteQuote }),
          ...(moods !== undefined && { moods }),
          ...(privateNotes !== undefined && { privateNotes }),
          ...(vibeCardTheme !== undefined && { vibeCardTheme }),
          ...(containsSpoilers !== undefined && { containsSpoilers }),
          ...(visibility !== undefined && { visibility }),
        };
      } else {
        state.finishedReads.unshift({
          bookId,
          finishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: Number(rating) || 5,
          reviewTitle: reviewTitle || '',
          reviewContent: reviewContent || '',
          favoriteQuote: favoriteQuote || '',
          moods: moods || ['Cozy'],
          privateNotes: privateNotes || '',
          vibeCardTheme: vibeCardTheme || 'Paper',
          containsSpoilers: containsSpoilers || false,
          visibility: visibility || 'public',
        });
      }
    },
    removeFinishedRead: (state, action) => {
      const { bookId } = action.payload;
      state.finishedReads = state.finishedReads.filter((item) => item.bookId !== bookId);
    },
    removeReading: (state, action) => {
      const { bookId } = action.payload;
      state.currentReading = state.currentReading.filter((item) => item.bookId !== bookId);
    },
  },
});

export const {
  startReading,
  updateProgress,
  finishReading,
  updateFinishedRead,
  removeFinishedRead,
  removeReading,
} = readingSlice.actions;
export default readingSlice.reducer;
