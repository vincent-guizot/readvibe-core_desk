import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineCloudDownload, AiOutlineDelete } from 'react-icons/ai';

export default function BooksPage({ books, onOpenImport, onOpenAddBook, onDeleteBook }) {
  const [search, setSearch] = useState('');

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const authorName = (b.author?.name || b.author?.pen_name || '').toLowerCase();
    return b.title.toLowerCase().includes(q) || authorName.includes(q) || (b.isbn || '').includes(q);
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>
            Manajemen Katalog Buku
          </h2>
          <p className="text-muted mb-0 small">Kelola metadata buku, stok fisik, dan tautan mood tags.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={onOpenAddBook}>
            <AiOutlinePlus /> Tambah Manual
          </button>
          <button className="btn btn-vd-primary btn-sm d-flex align-items-center gap-1" onClick={onOpenImport}>
            <AiOutlineCloudDownload size={18} /> 1-Click Import Google Books
          </button>
        </div>
      </div>

      <div className="vd-card p-4">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '340px' }}
            placeholder="Cari judul, penulis, atau ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="small text-muted">Menampilkan {filtered.length} buku</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Cover</th>
                <th>Judul & Penulis</th>
                <th>Kategori</th>
                <th>Mood Tags</th>
                <th>Stok Fisik</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <img
                      src={b.image || 'https://via.placeholder.com/40x60'}
                      alt={b.title}
                      className="rounded"
                      style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <div className="fw-bold">{b.title}</div>
                    <small className="text-muted">
                      {b.author?.name || b.author?.pen_name || 'Penulis Tidak Diketahui'} &bull; ISBN: {b.isbn || '-'}
                    </small>
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-dark">{b.genre?.name || '-'}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {(b.moods || []).map((m) => (
                        <span key={m.id} className="badge bg-light text-dark border" style={{ fontSize: '11px' }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${b.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {b.stock} eksemplar
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger p-1"
                      onClick={() => onDeleteBook(b.id, b.title)}
                      title="Hapus Buku"
                    >
                      <AiOutlineDelete size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
