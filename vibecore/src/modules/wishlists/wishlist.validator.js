export const validateWishlistPayload = (req) => {
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return validateWishlistUpdate(req);
};

export const validateWishlistUpdate = (req) => {
  const { priority, visibility, reason } = req.body;
  if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) return 'Prioritas wishlist harus Low, Medium, atau High.';
  if (visibility !== undefined && !['Public', 'Private'].includes(visibility)) return 'Visibilitas wishlist harus Public atau Private.';
  if (reason !== undefined && reason !== null && typeof reason !== 'string') return 'Alasan wishlist harus berupa teks.';
  return null;
};
