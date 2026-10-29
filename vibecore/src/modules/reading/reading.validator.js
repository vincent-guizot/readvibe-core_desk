export const validateStartReading = (req) => {
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return null;
};

export const validateFinishReading = (req) => {
  const { bookId, rating } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return 'Rating harus berada di antara 1 dan 5.';
  }
  return null;
};
