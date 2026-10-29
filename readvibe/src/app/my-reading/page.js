'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineCheckCircle, AiOutlineBook } from 'react-icons/ai';
import FinishBookModal from '../../components/FinishBookModal';
import VibeCardModal from '../../components/VibeCardModal';

export default function MyReadingPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookForFinish, setSelectedBookForFinish] = useState(null);
  const [selectedActivityForCard, setSelectedActivityForCard] = useState(null);
  const [token, setToken] = useState(null);

  const loadActivities = () => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);

    fetch(`${API_URL}/api/reading?status=Reading`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setActivities(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivities();
  }, [API_URL]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          📖 Rak Buku yang Sedang Dibaca
        </h2>
        <p className="text-muted small">Catat progres membaca dan tandai buku selesai untuk membuat kartu Vibe Card.</p>
      </div>

      {!token ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <p className="text-muted mb-3">Silakan login untuk mengakses rak membaca pribadimu.</p>
          <Link href="/login" className="btn btn-rv-plum rounded-pill px-4">
            Masuk ke ReadVibe
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <AiOutlineBook size={48} className="text-muted mb-3" />
          <h5>Belum ada buku yang sedang dibaca</h5>
          <p className="text-muted small mb-3">Temukan buku menarik dari katalog atau AI Vibe Matcher untuk mulai membaca.</p>
          <Link href="/discover" className="btn btn-rv-plum rounded-pill px-4">
            Jelajah Katalog Buku
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {activities.map((act) => (
            <div key={act.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 d-flex flex-row gap-3">
                <img
                  src={act.book?.image || 'https://via.placeholder.com/100x150'}
                  alt={act.book?.title}
                  className="rounded-3 shadow-sm"
                  style={{ width: '90px', height: '135px', objectFit: 'cover' }}
                />
                <div className="d-flex flex-column flex-grow-1">
                  <span className="badge bg-primary-subtle text-primary rounded-pill mb-1 align-self-start" style={{ fontSize: '10px' }}>
                    Sedang Dibaca
                  </span>
                  <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--rv-ink-plum)' }}>
                    {act.book?.title}
                  </h6>
                  <small className="text-muted mb-2">{act.book?.author?.name || 'Penulis'}</small>

                  <div className="mt-auto pt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-rv-coral text-white rounded-pill w-100 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                      onClick={() => setSelectedBookForFinish(act.book)}
                    >
                      <AiOutlineCheckCircle /> Tandai Selesai & Buat Vibe Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <FinishBookModal
        isOpen={!!selectedBookForFinish}
        onClose={() => setSelectedBookForFinish(null)}
        book={selectedBookForFinish}
        token={token}
        onSuccess={(finishedActivity) => {
          setSelectedBookForFinish(null);
          loadActivities();
          setSelectedActivityForCard(finishedActivity);
        }}
      />

      <VibeCardModal
        isOpen={!!selectedActivityForCard}
        onClose={() => setSelectedActivityForCard(null)}
        bookData={selectedActivityForCard}
      />
    </div>
  );
}
