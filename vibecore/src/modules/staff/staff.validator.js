export const validateStaffPayload = (req) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return 'Username, email, dan password wajib diisi.';
  }
  if (!role || !['Admin', 'Librarian'].includes(role)) {
    return 'Role harus Admin atau Librarian.';
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email tidak valid.';
  if (typeof username !== 'string' || username.trim().length < 3 || username.length > 100) return 'Username harus 3–100 karakter.';
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) return 'Password harus 12–128 karakter.';
  if (req.body.status !== undefined && !['Active', 'Suspended'].includes(req.body.status)) return 'Status tidak valid.';
  return null;
};

export const validateStaffUpdate = (req) => {
  if (req.body.role !== undefined && !['Admin', 'Librarian'].includes(req.body.role)) return 'Role tidak valid.';
  if (req.body.status !== undefined && !['Active', 'Suspended'].includes(req.body.status)) return 'Status tidak valid.';
  if (req.body.role === undefined && req.body.status === undefined) return 'Isi role atau status yang akan diperbarui.';
  return null;
};
