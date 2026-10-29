import React, { useState } from 'react';

export default function EditorialPicksPage({ picks, books, onRefresh, token, apiUrl }) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState(90);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedBookId) return;
    await fetch(`${apiUrl}/api/editorial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        bookId: selectedBookId,
        note,
        curationWeight: parseFloat(weight) / 100,
        active: true,
      }),
    });
    setNote('');
    onRefresh();
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Kurasi Pilihan Editor (Editorial Picks)
      </h2>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Tambah Pilihan Editor</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Pilih Buku</label>
                <select
                  className="form-select"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Buku dari Katalog --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author?.name || b.author?.pen_name || 'Penulis'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Catatan Kurator / Alasan Kurasi</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Alasan mengapa buku ini penting untuk direkomendasikan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Bobot Kurasi: {weight}% (Mempengaruhi prioritas AI)
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="50"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-vd-primary btn-sm w-100">
                Tetapkan Sebagai Pilihan Editor
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-7">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Kurasi Aktif</h5>
            <div className="d-flex flex-column gap-3">
              {picks.map((p) => (
                <div key={p.id} className="p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-warning text-dark me-2">
                        ★ Bobot: {Math.round((p.curationWeight || 1.0) * (p.curationWeight <= 1 ? 100 : 1))}%
                      </span>
                      <h6 className="fw-bold d-inline mb-0">{p.book?.title}</h6>
                    </div>
                  </div>
                  <p className="small text-muted mb-0 fst-italic">"{p.note}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
