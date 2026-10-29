import React from 'react';
import { AiOutlineSafety, AiOutlineCheck, AiOutlineClose, AiOutlineDelete } from 'react-icons/ai';

export default function ModerationPage({ reviews, onModerate }) {
  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>
        Antrean Moderasi Konten & Ulasan
      </h2>
      <p className="text-muted small mb-4">
        Tinjau laporan ulasan publik yang ditandai sebagai spam atau mengandung spoiler tanpa peringatan.
      </p>

      <div className="vd-card p-4">
        {reviews.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <AiOutlineSafety size={40} className="text-success mb-2" />
            <p className="mb-0">Tidak ada antrean ulasan yang bermasalah. Komunitas aman!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Pengguna</th>
                  <th>Buku</th>
                  <th>Isi Ulasan Publik</th>
                  <th>Status Moderasi</th>
                  <th>Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td>@{r.user?.username}</td>
                    <td>{r.book?.title}</td>
                    <td className="small fst-italic text-truncate" style={{ maxWidth: '280px' }}>
                      "{r.publicReview}"
                    </td>
                    <td>
                      <span className="badge bg-danger-subtle text-danger">
                        {r.moderationStatus || 'Flagged'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-success p-1"
                          onClick={() => onModerate(r.id, 'Approved')}
                          title="Setujui (Aman)"
                        >
                          <AiOutlineCheck size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-warning p-1"
                          onClick={() => onModerate(r.id, 'Rejected')}
                          title="Tolak / Sembunyikan"
                        >
                          <AiOutlineClose size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger p-1"
                          onClick={() => onModerate(r.id, 'Rejected', 'delete')}
                          title="Hapus Konten Ulasan"
                        >
                          <AiOutlineDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
