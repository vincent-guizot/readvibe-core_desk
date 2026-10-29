export const validateStaffPayload = (req) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return 'Username, email, dan password wajib diisi.';
  }
  if (!role || !['Admin', 'Librarian'].includes(role)) {
    return 'Role harus Admin atau Librarian.';
  }
  return null;
};
