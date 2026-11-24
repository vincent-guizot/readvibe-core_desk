import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCatalog } from '../../services/reader.api';

export const loadCatalog = createAsyncThunk('books/loadCatalog', fetchCatalog, {
  condition: (_, { getState }) => getState().books.status !== 'loading',
});

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  selectedMood: 'All',
  searchQuery: '',
  selectedGenre: 'All Genres',
  activeBookId: null,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSelectedMood: (state, action) => {
      state.selectedMood = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedGenre: (state, action) => {
      state.selectedGenre = action.payload;
    },
    setActiveBook: (state, action) => {
      state.activeBookId = action.payload;
    },
    addBook: (state, action) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCatalog.pending, (state) => { state.status = 'loading'; state.error = null; });
    builder.addCase(loadCatalog.fulfilled, (state, action) => { state.items = action.payload; state.status = 'succeeded'; state.error = null; });
    builder.addCase(loadCatalog.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
  },
});

export const { setSelectedMood, setSearchQuery, setSelectedGenre, setActiveBook, addBook } = booksSlice.actions;
export default booksSlice.reducer;
