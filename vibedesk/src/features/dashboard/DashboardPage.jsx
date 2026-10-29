import React from 'react';
import { AiOutlinePlus, AiOutlineCloudDownload } from 'react-icons/ai';

export default function DashboardPage({ kpi, books, onOpenImport, onOpenAddBook }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>
            VibeDesk Control Center
          </h2>
          <p className="text-muted mb-0 small">
            Ringkasan inventaris buku, aktivitas pembaca ReadVibe, dan status kurasi.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={onOpenAddBook}>
            <AiOutlinePlus /> Input Manual
          </button>
          <button className="btn btn-vd-primary btn-sm d-flex align-items-center gap-1" onClick={onOpenImport}>
            <AiOutlineCloudDownload size={18} /> 1-Click Import Google Books
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="vd-card p-3">
            <span className="text-muted small">Total Koleksi Buku</span>
            <h3 className="fw-bold mt-1 text-primary">{kpi?.totalBooks || books.length}</h3>
            <span className="badge bg-success-subtle text-success">Inventaris Aktif</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="vd-card p-3">
            <span className="text-muted small">Wishlist Aktif Member</span>
            <h3 className="fw-bold mt-1 text-info">{kpi?.totalWishlists || 0}</h3>
            <span className="badge bg-info-subtle text-info">Permintaan Incaran</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="vd-card p-3">
            <span className="text-muted small">Buku Selesai Dibaca</span>
            <h3 className="fw-bold mt-1 text-success">{kpi?.totalFinished || 0}</h3>
            <span className="badge bg-primary-subtle text-primary">Tuntas dibaca</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="vd-card p-3">
            <span className="text-muted small">Member Terdaftar</span>
            <h3 className="fw-bold mt-1 text-warning">{kpi?.totalMembers || 0}</h3>
            <span className="badge bg-warning-subtle text-warning">Komunitas Pembaca</span>
          </div>
        </div>
      </div>

      {/* Recent Books */}
      <div className="vd-card p-4">
        <h5 className="fw-bold mb-3" style={{ color: 'var(--vd-desk-navy)' }}>
          📚 Koleksi Buku Terbaru
        </h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Buku</th>
                <th>Penulis</th>
                <th>Kategori</th>
                <th>Stok Fisik</th>
                <th>ISBN</th>
                <th>Pratinjau</th>
              </tr>
            </thead>
            <tbody>
              {books.slice(0, 5).map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={b.image || 'https://via.placeholder.com/36x52'}
                        alt={b.title}
                        className="rounded"
                        style={{ width: '36px', height: '52px', objectFit: 'cover' }}
                      />
                      <span className="fw-semibold">{b.title}</span>
                    </div>
                  </td>
                  <td>{b.author?.name || b.author?.pen_name || '-'}</td>
                  <td>
                    <span className="badge bg-secondary-subtle text-dark">{b.genre?.name || '-'}</span>
                  </td>
                  <td>
                    <span className={`badge ${b.stock > 5 ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {b.stock} eks
                    </span>
                  </td>
                  <td className="small text-muted">{b.isbn || '-'}</td>
                  <td>
                    <span className={`badge ${b.embeddable ? 'bg-info' : 'bg-light text-dark border'}`}>
                      {b.embeddable ? 'Google Viewer' : 'Eksternal'}
                    </span>
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
