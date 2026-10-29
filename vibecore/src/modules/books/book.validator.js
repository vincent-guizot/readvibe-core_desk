export const validateBookPayload = (req) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return 'Judul buku wajib diisi.';
  }
  return null;
};
