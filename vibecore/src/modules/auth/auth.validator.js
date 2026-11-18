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

export const validateForgotPassword = (req) => {
  const { email } = req.body;
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Email yang valid wajib diisi.';
  }
  return null;
};

export const validateResetPassword = (req) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return 'Token reset tidak valid.';
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password minimal 12 karakter dan maksimal 72 byte UTF-8.';
  }
  return null;
};
