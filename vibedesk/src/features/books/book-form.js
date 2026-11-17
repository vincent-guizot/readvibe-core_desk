import { BOOK_TEXT_METADATA, BOOK_DIMENSIONS } from './book.constants.js';

export function getBookForm(book) {
  return {
    ...Object.fromEntries(Object.keys(BOOK_TEXT_METADATA).map((name) => [name, book?.[name] || ''])),
    widthCm: book?.widthCm ?? '',
    heightCm: book?.heightCm ?? '',
    title: book?.title || '',
    isbn: book?.isbn || '',
    authorId: String(book?.authorId || ''),
    genreId: String(book?.genreId || ''),
    year: book?.year ?? '',
    page: book?.page ?? '',
    stock: book?.stock ?? 1,
    price: book?.price ?? 0,
    description: book?.description || '',
    image: book?.image || '',
    moodIds: book?.moods?.map((mood) => mood.id) || [],
  };
}

export function validateBookForm(form) {
  const errors = {};
  for (const [name, { label, maxLength }] of Object.entries(BOOK_TEXT_METADATA)) {
    if (form[name].trim().length > maxLength) errors[name] = `${label} maksimal ${maxLength} karakter.`;
  }
  for (const [name, label] of Object.entries(BOOK_DIMENSIONS)) {
    const value = form[name];
    if (value !== '' && (!/^\d+(\.\d{1,2})?$/.test(String(value)) || Number(value) <= 0 || Number(value) > 999999.99)) {
      errors[name] = `${label} harus lebih dari 0, maksimal 999999.99 cm, dengan maksimal 2 angka desimal.`;
    }
  }
  if (!form.title.trim()) errors.title = 'Judul buku wajib diisi.';
  if (!form.authorId) errors.authorId = 'Pilih penulis.';
  if (!form.genreId) errors.genreId = 'Pilih kategori.';
  for (const [key, label] of Object.entries({ stock: 'Stok', price: 'Harga', year: 'Tahun', page: 'Jumlah halaman' })) {
    if ((key === 'stock' || key === 'price') && String(form[key]).trim() === '') {
      errors[key] = `${label} wajib diisi.`;
    } else if (form[key] !== '' && (!Number.isSafeInteger(Number(form[key])) || Number(form[key]) < 0)) {
      errors[key] = `${label} harus berupa angka bulat nol atau lebih.`;
    }
  }
  if (form.image.trim()) {
    try {
      if (!['http:', 'https:'].includes(new URL(form.image.trim()).protocol)) throw new Error();
    } catch {
      errors.image = 'Gunakan URL gambar http atau https yang valid.';
    }
  }
  return errors;
}

export function toBookPayload(form) {
  return {
    ...Object.fromEntries(Object.keys(BOOK_TEXT_METADATA).map((name) => [name, form[name].trim() || null])),
    widthCm: form.widthCm === '' ? null : Number(form.widthCm),
    heightCm: form.heightCm === '' ? null : Number(form.heightCm),
    title: form.title.trim(),
    isbn: form.isbn.trim(),
    authorId: Number(form.authorId),
    genreId: Number(form.genreId),
    year: form.year === '' ? null : Number(form.year),
    page: form.page === '' ? null : Number(form.page),
    stock: Number(form.stock),
    price: Number(form.price),
    description: form.description.trim(),
    image: form.image.trim(),
    moodIds: form.moodIds,
  };
}
