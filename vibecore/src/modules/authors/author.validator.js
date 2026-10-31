export const validateAuthorPayload = (req) => {
  const name = req.body.name || req.body.pen_name;
  if (!name || name.trim() === '') {
    return 'Nama penulis wajib diisi.';
  }
  return null;
};
