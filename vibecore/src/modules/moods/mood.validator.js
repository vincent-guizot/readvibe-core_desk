export const validateMoodPayload = (req) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return 'Nama mood tag wajib diisi.';
  }
  return null;
};
