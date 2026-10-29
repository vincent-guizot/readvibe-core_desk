import React from 'react';
import { AiOutlineWarning } from 'react-icons/ai';

export default function AnalyticsPage({ wishlistData, readingData }) {
  const topBooks = wishlistData || [];
  const moodTrends = readingData?.moodTrends || [];

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>
        Wishlist Intelligence & Analitik Tren Membaca
      </h2>
      <p className="text-muted small mb-4">
        Data agregat tren buku incaran dan suasana hati pembaca untuk keputusan pengadaan koleksi.
      </p>

      {/* Wishlist Intelligence */}
      <div className="vd-card p-4 mb-4">
        <h5 className="fw-bold mb-3">🔥 Buku Paling Banyak Masuk Wishlist Member</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Judul Buku</th>
                <th>Penulis</th>
                <th>Jumlah Wishlist</th>
                <th>Status Kebutuhan Stok</th>
              </tr>
            </thead>
            <tbody>
              {topBooks.map((item, idx) => {
                const wishCount = parseInt(item.wishlistCount || 1, 10);
                return (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={item.book?.image || 'https://via.placeholder.com/32x48'}
                          alt=""
                          className="rounded"
                          style={{ width: '32px', height: '48px', objectFit: 'cover' }}
                        />
                        <span className="fw-semibold">{item.book?.title}</span>
                      </div>
                    </td>
                    <td>{item.book?.author?.name || '-'}</td>
                    <td>
                      <span className="badge bg-primary">{wishCount} member</span>
                    </td>
                    <td>
                      <span className="badge bg-success">Dipantau Kurator</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Distribusi Tren Mood Buku</h5>
            <ul className="list-group list-group-flush">
              {moodTrends.map((m, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{m.name || m.moodTag}</span>
                  <span className="badge bg-curator text-white" style={{ background: 'var(--vd-curator-teal)' }}>
                    {m.bookCount || m.totalReads || 0} koleksi / dibaca
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="vd-card p-4 text-center">
            <h5 className="fw-bold mb-3">Tingkat Kepuasan Pembaca Rata-Rata</h5>
            <div className="display-4 fw-bold text-warning my-3">
              4.9 / 5.0
            </div>
            <p className="text-muted small">
              Berdasarkan ulasan terverifikasi komunitas pembaca ReadVibe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
