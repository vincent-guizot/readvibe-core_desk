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
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return validateReadingUpdate(req);
};

export const validateReadingUpdate = (req) => {
  const { status, rating, isSpoiler } = req.body;
  if (status !== undefined && !['Want to Read', 'Reading', 'Finished'].includes(status)) return 'Status membaca tidak valid.';
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return 'Rating harus berupa angka bulat antara 1 dan 5.';
  if (isSpoiler !== undefined && typeof isSpoiler !== 'boolean') return 'isSpoiler harus berupa boolean.';
  if (req.body.reviewTitle !== undefined && (typeof req.body.reviewTitle !== 'string' || req.body.reviewTitle.length > 255)) return 'Judul ulasan maksimal 255 karakter.';
  if (req.body.reviewVisibility !== undefined && !['Public', 'Private'].includes(req.body.reviewVisibility)) return 'Visibilitas ulasan tidak valid.';
  for (const field of ['quote', 'privateNote', 'publicReview', 'moodTag']) {
    if (req.body[field] !== undefined && req.body[field] !== null && typeof req.body[field] !== 'string') return `${field} harus berupa teks.`;
  }
  return validateReadingProgress(req);
};
