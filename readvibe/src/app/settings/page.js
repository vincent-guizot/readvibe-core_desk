'use client';

import React from 'react';

export default function SettingsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          ⚙️ Pengaturan Aplikasi
        </h2>
        <p className="text-muted small">Konfigurasi preferensi dan koneksi layanan ekosistem ReadVibe.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 mx-auto" style={{ maxWidth: '640px' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)' }}>
          Koneksi Ekosistem & API
        </h5>
        <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>VibeCore Backend Service</strong>
            <p className="text-muted small mb-0">{API_URL}/api</p>
          </div>
          <span className="badge bg-success">Port 3360 Terhubung</span>
        </div>

        <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
          <div>
            <strong>Aplikasi ReadVibe (Next.js)</strong>
            <p className="text-muted small mb-0">http://localhost:3350</p>
          </div>
          <span className="badge bg-primary">Origin Terdaftar</span>
        </div>
      </div>
    </div>
  );
}
