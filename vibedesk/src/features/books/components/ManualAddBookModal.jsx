import React, { useState } from 'react';
import { booksApi, getApiErrorMessage } from '../../../services/catalog-api';

const getInitialForm = (book) => ({
  title: book?.title || '',
  authorId: book?.authorId ? String(book.authorId) : '',
  genreId: book?.genreId ? String(book.genreId) : '',
  isbn: book?.isbn || '',
  stock: book?.stock ?? 5,
  description: book?.description || '',
  image: book?.image || '',
  selectedMoods: book?.moods?.map((mood) => mood.id) || [],
});

export default function ManualAddBookModal({ isOpen, onClose, authors, categories, moods, onAddSuccess, book }) {
  const [form, setForm] = useState(() => getInitialForm(book));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(book?.id);

  if (!isOpen) return null;

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        authorId: form.authorId ? Number(form.authorId) : null,
        genreId: form.genreId ? Number(form.genreId) : null,
        isbn: form.isbn.trim(),
        stock: Number(form.stock),
        description: form.description.trim(),
        image: form.image.trim() || undefined,
        moodIds: form.selectedMoods,
      };

      if (isEditing) {
        await booksApi.update(book.id, payload);
      } else {
        await booksApi.create(payload);
      }
      onAddSuccess();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Buku gagal disimpan.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMood = (id) => {
    setForm((current) => ({
      ...current,
      selectedMoods: current.selectedMoods.includes(id)
        ? current.selectedMoods.filter((moodId) => moodId !== id)
        : [...current.selectedMoods, id],
    }));
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} role="dialog" aria-modal="true" aria-labelledby="book-form-title">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--vd-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 id="book-form-title" className="modal-title fw-bold" style={{ color: 'var(--vd-desk-navy)' }}>{isEditing ? 'Ubah Buku Katalog' : 'Input Buku Manual ke Katalog'}</h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup" disabled={loading}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold" htmlFor="book-title">Judul Buku</label>
                  <input id="book-title" type="text" className="form-control" placeholder="Judul lengkap buku" value={form.title} onChange={(event) => updateField('title', event.target.value)} required disabled={loading} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold" htmlFor="book-isbn">ISBN</label>
                  <input id="book-isbn" type="text" className="form-control" placeholder="13 digit ISBN" value={form.isbn} onChange={(event) => updateField('isbn', event.target.value)} disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="book-author">Penulis</label>
                  <select id="book-author" className="form-select" value={form.authorId} onChange={(event) => updateField('authorId', event.target.value)} required disabled={loading}>
                    <option value="">-- Pilih Penulis --</option>
                    {authors.map((author) => <option key={author.id} value={author.id}>{author.name || author.pen_name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="book-category">Kategori / Genre</label>
                  <select id="book-category" className="form-select" value={form.genreId} onChange={(event) => updateField('genreId', event.target.value)} required disabled={loading}>
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold" htmlFor="book-stock">Stok Fisik Tersedia</label>
                  <input id="book-stock" type="number" className="form-control" min="0" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} required disabled={loading} />
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-semibold" htmlFor="book-cover">URL Cover Buku</label>
                  <input id="book-cover" type="url" className="form-control" placeholder="https://..." value={form.image} onChange={(event) => updateField('image', event.target.value)} disabled={loading} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Hubungkan dengan Mood Tags</label>
                  <div className="d-flex flex-wrap gap-2">
                    {moods.map((mood) => <button key={mood.id} type="button" onClick={() => toggleMood(mood.id)} className={`btn btn-sm rounded-pill ${form.selectedMoods.includes(mood.id) ? 'btn-vd-primary' : 'btn-outline-secondary'}`} disabled={loading}>{mood.name}</button>)}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold" htmlFor="book-description">Sinopsis / Deskripsi Buku</label>
                  <textarea id="book-description" className="form-control" rows="3" value={form.description} onChange={(event) => updateField('description', event.target.value)} disabled={loading} />
                </div>
              </div>
            </div>
            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>Batal</button>
              <button type="submit" className="btn btn-vd-primary btn-sm px-4" disabled={loading}>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Buku'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
