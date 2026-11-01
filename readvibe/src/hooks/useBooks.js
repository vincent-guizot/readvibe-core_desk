'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  setSelectedMood,
  setSearchQuery,
  setSelectedGenre,
  setActiveBook,
} from '../redux/slices/booksSlice';

export function useBooks() {
  const dispatch = useAppDispatch();
  const { items: books, selectedMood, searchQuery, selectedGenre, activeBookId } = useAppSelector(
    (state) => state.books
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Mood matching
      const matchesMood =
        selectedMood === 'All' ||
        (book.moods &&
          book.moods.some((m) => m.toLowerCase().includes(selectedMood.toLowerCase())));

      // Search query matching
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query) ||
        (book.synopsis && book.synopsis.toLowerCase().includes(query));

      // Genre matching
      const matchesGenre =
        selectedGenre === 'All Genres' ||
        book.genre.toLowerCase() === selectedGenre.toLowerCase();

      return matchesMood && matchesQuery && matchesGenre;
    });
  }, [books, selectedMood, searchQuery, selectedGenre]);

  const getBookById = (idOrSlug) => {
    return books.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || null;
  };

  return {
    books,
    filteredBooks,
    selectedMood,
    searchQuery,
    selectedGenre,
    activeBookId,
    setMood: (mood) => dispatch(setSelectedMood(mood)),
    setSearch: (query) => dispatch(setSearchQuery(query)),
    setGenre: (genre) => dispatch(setSelectedGenre(genre)),
    setActiveBook: (id) => dispatch(setActiveBook(id)),
    getBookById,
  };
}

export default useBooks;
