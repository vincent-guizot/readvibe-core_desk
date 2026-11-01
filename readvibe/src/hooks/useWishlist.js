'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  updateWishlistNote,
} from '../redux/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const { items: wishlist } = useAppSelector((state) => state.wishlist);

  const isWishlisted = (bookId) => {
    return wishlist.some((item) => item.bookId === bookId);
  };

  const getWishlistItem = (bookId) => {
    return wishlist.find((item) => item.bookId === bookId) || null;
  };

  return {
    wishlist,
    isWishlisted,
    getWishlistItem,
    addWishlist: (data) => dispatch(addToWishlist(data)),
    removeWishlist: (bookId) => dispatch(removeFromWishlist({ bookId })),
    toggleWishlist: (bookId, priority, reason) =>
      dispatch(toggleWishlist({ bookId, priority, reason })),
    updateNote: (bookId, reason, priority) =>
      dispatch(updateWishlistNote({ bookId, reason, priority })),
  };
}

export default useWishlist;
