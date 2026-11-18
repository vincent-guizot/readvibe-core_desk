'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import {
  startReading,
  updateProgress,
  finishReading,
  updateFinishedRead,
  removeFinishedRead,
  removeReading,
} from '../redux/slices/readingSlice';

export function useReading() {
  const dispatch = useAppDispatch();
  const { currentReading, finishedReads, status, error } = useAppSelector((state) => state.reading);

  const getBookProgress = (bookId) => {
    return currentReading.find((item) => String(item.bookId) === String(bookId)) || null;
  };

  const isBookFinished = (bookId) => {
    return finishedReads.some((item) => String(item.bookId) === String(bookId));
  };

  const getFinishedDetail = (bookId) => {
    return finishedReads.find((item) => String(item.bookId) === String(bookId)) || null;
  };

  return {
    status, error,
    currentReading,
    finishedReads,
    getBookProgress,
    isBookFinished,
    getFinishedDetail,
    startBook: (bookId, totalPages) => dispatch(startReading({ bookId, totalPages })),
    updateBookProgress: (bookId, currentPage, notes) =>
      dispatch(updateProgress({ bookId, currentPage, notes })),
    finishBook: (data) => dispatch(finishReading(data)),
    updateFinishedRead: (data) => dispatch(updateFinishedRead(data)),
    removeFinishedRead: (bookId) => dispatch(removeFinishedRead({ bookId })),
    removeBook: (bookId) => dispatch(removeReading({ bookId })),
  };
}

export default useReading;
