export const toWishlistResource = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    userId: item.userId,
    bookId: item.bookId,
    priority: item.priority,
    reason: item.reason,
    visibility: item.visibility,
    book: item.book,
    createdAt: item.createdAt,
  };
};
