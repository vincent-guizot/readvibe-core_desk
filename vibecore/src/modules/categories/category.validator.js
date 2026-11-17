export const validateCategoryPayload = (req) => {
  const { name } = req.body;
  if (typeof name !== 'string' || name.trim() === '' || name.length > 255) {
    return 'Nama kategori/genre wajib diisi.';
  }
  return validateCategoryUpdatePayload(req);
};

export const validateCategoryUpdatePayload = (req) => {
  const { name, description } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return 'Nama kategori/genre tidak boleh kosong.';
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'Deskripsi kategori harus berupa teks.';
  }
  return null;
};
