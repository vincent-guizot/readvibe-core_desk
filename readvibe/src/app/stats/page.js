'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StatsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (!savedToken) return;
    setToken(savedToken);

    // Fetch user activities to compute stats
    fetch(`${API_URL}/api/reading?status=Finished`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          const finished = res.data;
          const totalPages = finished.reduce((acc, curr) => acc + (curr.book?.page || 0), 0);
          const moodCount = {};
          finished.forEach((item) => {
            if (item.moodTag) {
              moodCount[item.moodTag] = (moodCount[item.moodTag] || 0) + 1;
            }
          });
          const topMood = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0] || '🧘 Calm & Mindful';

          setStats({
            totalFinished: finished.length,
            totalPages,
            topMood,
            averageRating: (finished.reduce((acc, curr) => acc + (curr.rating || 5), 0) / (finished.length || 1)).toFixed(1),
          });
        }
      })
      .catch(console.error);
  }, [API_URL]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          📊 Statistik & Riwayat Membaca
        </h2>
        <p className="text-muted small">Refleksi pencapaian dan kebiasaan literasi pribadimu.</p>
      </div>

      {!token ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <p className="text-muted mb-3">Silakan login untuk melihat statistik membaca pribadimu.</p>
          <Link href="/login" className="btn btn-rv-plum rounded-pill px-4">
            Masuk ke ReadVibe
          </Link>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <span className="text-muted small">Total Buku Selesai</span>
              <h2 className="fw-bold mt-2" style={{ color: 'var(--rv-ink-plum)' }}>
                {stats?.totalFinished || 0}
              </h2>
              <span className="badge bg-success-subtle text-success">Pencapaian Tuntas</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <span className="text-muted small">Total Halaman Dibaca</span>
              <h2 className="fw-bold mt-2" style={{ color: 'var(--rv-vibe-coral)' }}>
                {stats?.totalPages || 0}
              </h2>
              <span className="badge bg-danger-subtle text-danger">Halaman Literasi</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <span className="text-muted small">Mood Dominan</span>
              <h5 className="fw-bold mt-2 text-truncate" style={{ color: 'var(--rv-ink-plum)' }}>
                {stats?.topMood || 'Belum Ada'}
              </h5>
              <span className="badge bg-primary-subtle text-primary">Frekuensi Terbanyak</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <span className="text-muted small">Rating Rata-Rata</span>
              <h2 className="fw-bold mt-2 text-warning">
                ★ {stats?.averageRating || '5.0'}
              </h2>
              <span className="badge bg-warning-subtle text-warning">Kepuasan Membaca</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
