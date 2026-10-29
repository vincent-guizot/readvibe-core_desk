import React, { useState } from 'react';

export default function ManualAddBookModal({ isOpen, onClose, token, authors, categories, moods, onAddSuccess, apiUrl }) {
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [stock, setStock] = useState(5);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          authorId: authorId ? parseInt(authorId, 10) : null,
          genreId: genreId ? parseInt(genreId, 10) : null,
          isbn,
          stock: parseInt(stock, 10) || 1,
          description,
          image: image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          moodIds: selectedMoods,
        }),
      });

      if (res.ok) {
        onAddSuccess();
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menyimpan buku.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMood = (id) => {
    setSelectedMoods((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--vd-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold" style={{ color: 'var(--vd-desk-navy)' }}>
              Input Buku Manual ke Katalog
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Judul Buku</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Judul lengkap buku"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">ISBN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="13 digit ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Penulis</label>
                  <select
                    className="form-select"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Penulis --</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name || a.pen_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Kategori / Genre</label>
                  <select
                    className="form-select"
                    value={genreId}
                    onChange={(e) => setGenreId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Stok Fisik Tersedia</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label small fw-semibold">URL Cover Buku</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Hubungkan dengan Mood Tags</label>
                  <div className="d-flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMood(m.id)}
                        className={`btn btn-sm rounded-pill ${
                          selectedMoods.includes(m.id) ? 'btn-vd-primary' : 'btn-outline-secondary'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Sinopsis / Deskripsi Buku</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-vd-primary btn-sm px-4" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Buku'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
