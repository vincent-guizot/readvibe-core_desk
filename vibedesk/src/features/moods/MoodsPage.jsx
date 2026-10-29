import React, { useState } from 'react';

export default function MoodsPage({ moods, onRefresh, token, apiUrl }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#EF786B');

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${apiUrl}/api/moods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description: desc, color }),
    });
    setName('');
    setDesc('');
    onRefresh();
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Taksonomi Mood & Suasana Hati
      </h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Tambah Mood Tag</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nama Mood (dengan Emoji)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Misal: ☕ Cozy Sunday"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Warna Aksen</label>
                <input
                  type="color"
                  className="form-control form-control-color w-100"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Deskripsi Resonansi Emosi</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Buku yang membawa rasa hangat dan santai..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-vd-primary btn-sm w-100">
                Simpan Mood Tag
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Mood Tags ({moods.length})</h5>
            <div className="d-flex flex-column gap-3">
              {moods.map((m) => (
                <div key={m.id} className="p-3 border rounded bg-light" style={{ borderLeft: `5px solid ${m.color || '#EF786B'}` }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold mb-0 text-primary">{m.name}</h6>
                    <span className="badge bg-light text-dark border">
                      {m.books ? m.books.length : 0} Buku Terhubung
                    </span>
                  </div>
                  <p className="small text-muted mb-0">{m.description || 'Tidak ada deskripsi.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
