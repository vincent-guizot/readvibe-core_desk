'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  updateWishlistNote,
  loadWishlist,
} from '../redux/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const { items: wishlist, status, error } = useAppSelector((state) => state.wishlist);

  const isWishlisted = (bookId) => {
    return wishlist.some((item) => String(item.bookId) === String(bookId));
  };

  const getWishlistItem = (bookId) => {
    return wishlist.find((item) => String(item.bookId) === String(bookId)) || null;
  };

  return {
    status, error,
    wishlist,
    isWishlisted,
    isInWishlist: isWishlisted,
    getWishlistItem,
    addWishlist: (data) => dispatch(addToWishlist(data)),
    removeWishlist: (bookId) => dispatch(removeFromWishlist({ bookId })),
    toggleWishlist: (bookId, priority, reason) =>
      dispatch(toggleWishlist({ bookId, priority, reason })),
    updateNote: (bookId, reason, priority) =>
      dispatch(updateWishlistNote({ bookId, reason, priority })),
    loadWishlist: () => dispatch(loadWishlist()),
    reloadWishlist: () => dispatch(loadWishlist()),
  };
}

export default useWishlist;
