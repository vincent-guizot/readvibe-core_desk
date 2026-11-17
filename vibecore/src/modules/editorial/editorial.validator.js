export const validateEditorialPayload = (req) => {
  const { bookId } = req.body;
  if (!bookId) {
    return 'bookId wajib diisi.';
  }
  return validateEditorialUpdatePayload(req);
};

export const validateEditorialUpdatePayload = (req) => {
  const { tagline, note, curatorNotes, curationWeight } = req.body;
  if (tagline !== undefined && (typeof tagline !== 'string' || tagline.trim() === '')) {
    return 'Tagline editorial tidak boleh kosong.';
  }
  if (note !== undefined && typeof note !== 'string') return 'Catatan kurator harus berupa teks.';
  if (curatorNotes !== undefined && typeof curatorNotes !== 'string') return 'Catatan kurator harus berupa teks.';
  if (curationWeight !== undefined) {
    const weight = Number(curationWeight);
    if (!Number.isFinite(weight) || weight < 50 || weight > 100) {
      return 'Bobot kurasi harus berada di antara 50 dan 100.';
    }
  }
  return null;
};
