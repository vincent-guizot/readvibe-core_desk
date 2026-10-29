export const validateMemberStatus = (req) => {
  const { status } = req.body;
  if (!status) {
    return 'Status wajib diisi.';
  }
  return null;
};
