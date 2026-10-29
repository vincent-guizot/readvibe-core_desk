export const validateWishlistPayload = (req) => {
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return null;
};
