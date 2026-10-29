'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiFillStar, AiOutlineShareAlt } from 'react-icons/ai';
import VibeCardModal from '../../components/VibeCardModal';

export default function FinishedReadsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [finishedList, setFinishedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivityForCard, setSelectedActivityForCard] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);

    fetch(`${API_URL}/api/reading?status=Finished`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setFinishedList(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API_URL]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          🏆 Buku yang Telah Selesai Dibaca
        </h2>
        <p className="text-muted small">Koleksi pencapaian membaca dan kartu visual 9:16 untuk dibagikan ke media sosial.</p>
      </div>

      {!token ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <p className="text-muted mb-3">Silakan login untuk melihat catatan buku selesai.</p>
          <Link href="/login" className="btn btn-rv-plum rounded-pill px-4">
            Masuk ke ReadVibe
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : finishedList.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <h5>Belum ada buku yang diselesaikan</h5>
          <p className="text-muted small mb-3">Tandai buku yang sedang kamu baca saat sudah selesai membaca.</p>
          <Link href="/my-reading" className="btn btn-rv-plum rounded-pill px-4">
            Lihat Rak Sedang Dibaca
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {finishedList.map((act) => (
            <div key={act.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 d-flex flex-column">
                <div className="d-flex gap-3 mb-3">
                  <img
                    src={act.book?.image || 'https://via.placeholder.com/90x135'}
                    alt={act.book?.title}
                    className="rounded-3 shadow-sm"
                    style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1 text-truncate" style={{ maxWidth: '180px', color: 'var(--rv-ink-plum)' }}>
                      {act.book?.title}
                    </h6>
                    <small className="text-muted d-block mb-1">{act.book?.author?.name || 'Penulis'}</small>

                    <div className="d-flex align-items-center text-warning mb-1">
                      {[...Array(act.rating || 5)].map((_, i) => (
                        <AiFillStar key={i} size={14} />
                      ))}
                    </div>

                    <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>
                      {act.moodTag || 'Thoughtful'}
                    </span>
                  </div>
                </div>

                {act.quote && (
                  <div className="bg-light p-2 rounded-2 mb-3 flex-grow-1">
                    <small className="text-muted fst-italic d-block" style={{ fontSize: '11px' }}>
                      "{act.quote}"
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    type="button"
                    className="btn btn-sm btn-rv-coral text-white rounded-pill w-100 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                    onClick={() => setSelectedActivityForCard(act)}
                  >
                    <AiOutlineShareAlt size={16} /> Buka / Download Vibe Card (9:16)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vibe Card Modal */}
      <VibeCardModal
        isOpen={!!selectedActivityForCard}
        onClose={() => setSelectedActivityForCard(null)}
        bookData={selectedActivityForCard}
      />
    </div>
  );
}
