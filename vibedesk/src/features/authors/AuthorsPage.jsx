import React, { useState } from 'react';

export default function AuthorsPage({ authors, onRefresh, token, apiUrl }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch(`${apiUrl}/api/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, bio }),
    });
    setName('');
    setBio('');
    onRefresh();
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Manajemen Penulis
      </h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Tambah Penulis Baru</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nama Pena / Penulis</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Misal: Pramoedya Ananta Toer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Biografi Singkat</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Profil dan latar belakang penulis..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-vd-primary btn-sm w-100">
                Simpan Penulis
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Penulis Terdaftar ({authors.length})</h5>
            <ul className="list-group list-group-flush">
              {authors.map((a) => (
                <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-semibold">{a.name || a.pen_name}</span>
                    {a.bio && <p className="small text-muted mb-0">{a.bio}</p>}
                  </div>
                  <span className="badge bg-light text-dark border">
                    {a.books ? a.books.length : 0} Buku Terdaftar
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
