export const validateReviewPayload = (req) => {
  const { bookId, publicReview } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  if (!publicReview || publicReview.trim() === '') {
    return 'Teks ulasan publik tidak boleh kosong.';
  }
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
