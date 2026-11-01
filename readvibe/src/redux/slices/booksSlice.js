import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_BOOKS } from '../../constants';

const initialState = {
  items: INITIAL_BOOKS,
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
});

export const { setSelectedMood, setSearchQuery, setSelectedGenre, setActiveBook, addBook } = booksSlice.actions;
export default booksSlice.reducer;
