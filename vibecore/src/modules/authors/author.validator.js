const hasText = (value) => typeof value === 'string' && value.trim() !== '';

export const validateAuthorPayload = (req) => {
  const name = req.body.name ?? req.body.pen_name;
  if (typeof name !== 'string' || name.trim() === '' || name.length > 255) {
    return 'Nama penulis wajib diisi.';
  }
  return validateAuthorUpdatePayload(req);
};

export const validateAuthorUpdatePayload = (req) => {
  const { name, pen_name: penName, bio } = req.body;
  if (name !== undefined && !hasText(name)) return 'Nama penulis tidak boleh kosong.';
  if (penName !== undefined && !hasText(penName)) return 'Nama penulis tidak boleh kosong.';
  if (bio !== undefined && typeof bio !== 'string') return 'Biografi penulis harus berupa teks.';
  return null;
};
