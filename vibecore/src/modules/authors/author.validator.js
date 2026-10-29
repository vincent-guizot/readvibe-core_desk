export const validateAuthorPayload = (req) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return 'Nama penulis wajib diisi.';
  }
  return null;
};
