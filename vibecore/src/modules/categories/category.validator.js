export const validateCategoryPayload = (req) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return 'Nama kategori/genre wajib diisi.';
  }
  return null;
};
