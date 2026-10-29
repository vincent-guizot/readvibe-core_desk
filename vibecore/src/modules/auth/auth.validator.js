export const validateRegister = (req) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return 'Username, email, dan password wajib diisi.';
  }
  if (password.length < 6) {
    return 'Password minimal 6 karakter.';
  }
  return null;
};

export const validateLogin = (req) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return 'Email dan password wajib diisi.';
  }
  return null;
};
