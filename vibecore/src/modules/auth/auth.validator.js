export const validateRegister = (req) => {
  const { username, email, password } = req.body;
  if (typeof username !== 'string' || !username.trim() || username.length > 255 || typeof email !== 'string' || typeof password !== 'string' || !password) {
    return 'Username, email, dan password wajib diisi.';
  }
  if (password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password minimal 6 karakter dan maksimal 72 byte UTF-8.';
  }
  if (req.body.fullname !== undefined && (typeof req.body.fullname !== 'string' || req.body.fullname.length > 255)) return 'Nama lengkap maksimal 255 karakter.';
  return validateForgotPassword(req);
};

export const validateLogin = (req) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || !email || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return 'Email dan password wajib diisi.';
  }
  return null;
};

export const validateProfile = (req) => {
  for (const [field, maximum] of [['fullname', 255], ['image', 255], ['bio', 2000], ['location', 255]]) {
    if (req.body[field] !== undefined && (typeof req.body[field] !== 'string' || req.body[field].length > maximum)) return `${field} harus berupa teks maksimal ${maximum} karakter.`;
  }
  if (req.body.username !== undefined && (typeof req.body.username !== 'string' || !/^[a-zA-Z0-9_-]{3,50}$/.test(req.body.username))) return 'Username harus 3–50 karakter huruf, angka, tanda hubung atau underscore.';
  return null;
};

export const validateAccountPassword = (req) => {
  if (typeof req.body.currentPassword !== 'string' || !req.body.currentPassword || Buffer.byteLength(req.body.currentPassword, 'utf8') > 72) return 'Password saat ini wajib diisi.';
  return null;
};

const validateNewPassword = (password) => {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) return 'Password minimal 12 karakter dan maksimal 72 byte UTF-8.';
  return null;
};

export const validatePasswordChange = (req) => validateAccountPassword(req) || validateNewPassword(req.body.password);
export const validateEmailChange = (req) => validateAccountPassword(req) || validateForgotPassword(req);

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
  return validateNewPassword(password);
};
