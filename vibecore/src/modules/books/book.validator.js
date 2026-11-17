import { validateBookMetadata } from './book.metadata';

const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

const validateBookFields = (payload, { requireTitle }) => {
  const { title, stock, year, page } = payload;
  if (requireTitle && (!title || typeof title !== 'string' || title.trim() === '')) {
    return 'Judul buku wajib diisi.';
  }
  if (!requireTitle && title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return 'Judul buku tidak boleh kosong.';
  }
  if (stock !== undefined && !isNonNegativeInteger(stock)) return 'Stok buku harus berupa angka bulat nol atau lebih.';
  if (year !== undefined && !isNonNegativeInteger(year)) return 'Tahun terbit harus berupa angka bulat nol atau lebih.';
  if (page !== undefined && !isNonNegativeInteger(page)) return 'Jumlah halaman harus berupa angka bulat nol atau lebih.';
  return validateBookMetadata(payload);
};

export const validateBookPayload = (req) => validateBookFields(req.body, { requireTitle: true });

export const validateBookUpdatePayload = (req) => validateBookFields(req.body, { requireTitle: false });
