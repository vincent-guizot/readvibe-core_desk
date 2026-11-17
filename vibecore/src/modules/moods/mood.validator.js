export const validateMoodPayload = (req) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return 'Nama mood tag wajib diisi.';
  }
  return null;
};

export const validateMoodUpdatePayload = (req) => {
  const { name, description, color } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return 'Nama mood tag tidak boleh kosong.';
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'Deskripsi mood tag harus berupa teks.';
  }
  if (color !== undefined && (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color))) {
    return 'Warna mood tag harus berupa kode HEX enam digit.';
  }
  return null;
};
