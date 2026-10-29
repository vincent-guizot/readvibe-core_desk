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
