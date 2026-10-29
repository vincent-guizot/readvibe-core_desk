import React, { useState } from 'react';

export default function CategoriesPage({ categories, onRefresh, token, apiUrl }) {
  const [newCat, setNewCat] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat) return;
    await fetch(`${apiUrl}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newCat, description }),
    });
    setNewCat('');
    setDescription('');
    onRefresh();
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Kategori & Genre Buku
      </h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Tambah Kategori Baru</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nama Kategori</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Misal: Biografi & Memoar"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Deskripsi</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Cakupan topik kategori..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-vd-primary btn-sm w-100">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Kategori ({categories.length})</h5>
            <div className="row g-2">
              {categories.map((c) => (
                <div className="col-md-6" key={c.id}>
                  <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-semibold">{c.name}</span>
                      {c.description && <p className="small text-muted mb-0">{c.description}</p>}
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {c.books ? c.books.length : 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
