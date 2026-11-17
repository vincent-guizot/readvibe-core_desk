export const COVER_ACCEPT = 'image/jpeg,image/png,image/webp';
export const MAX_COVER_BYTES = 5 * 1024 * 1024;

export function validateCoverFile(file) {
  if (!file) return 'Pilih file cover terlebih dahulu.';
  if (!COVER_ACCEPT.split(',').includes(file.type)) return 'Cover harus berupa JPG, PNG, atau WEBP.';
  if (file.size === 0) return 'File cover kosong.';
  if (file.size > MAX_COVER_BYTES) return 'Ukuran cover maksimal 5 MB.';
  return null;
}
