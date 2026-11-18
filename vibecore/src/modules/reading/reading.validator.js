export const validateReadingProgress = (req) => {
  const { currentPage } = req.body;
  if (currentPage !== undefined && (!Number.isInteger(currentPage) || currentPage < 0 || currentPage > 2147483647)) {
    return 'currentPage harus berupa bilangan bulat antara 0 dan 2147483647.';
  }
  return null;
};

export const validateStartReading = (req) => {
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return validateReadingProgress(req);
};

export const validateFinishReading = (req) => {
  const { bookId, rating } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return 'Rating harus berada di antara 1 dan 5.';
  }
  return validateReadingProgress(req);
};
