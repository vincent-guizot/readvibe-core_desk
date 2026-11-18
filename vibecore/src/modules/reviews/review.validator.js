export const validateReviewPayload = (req) => {
  const { bookId, publicReview, rating, isSpoiler } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  if (typeof publicReview !== 'string' || publicReview.trim() === '') {
    return 'Teks ulasan publik tidak boleh kosong.';
  }
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return 'Rating harus berupa angka bulat antara 1 dan 5.';
  if (isSpoiler !== undefined && typeof isSpoiler !== 'boolean') return 'isSpoiler harus berupa boolean.';
  if (req.body.reviewTitle !== undefined && (typeof req.body.reviewTitle !== 'string' || req.body.reviewTitle.length > 255)) return 'Judul ulasan maksimal 255 karakter.';
  return null;
};

export const validateReviewReport = (req) => {
  const { reason } = req.body;
  if (
    reason !== undefined &&
    (typeof reason !== 'string' || reason.length > 255)
  )
    return 'Alasan laporan harus berupa teks maksimal 255 karakter.';
  return null;
};
