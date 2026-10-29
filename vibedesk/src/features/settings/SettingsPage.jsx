import React from 'react';

export default function SettingsPage({ apiUrl }) {
  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Pengaturan & Status Sistem Ekosistem
      </h2>

      <div className="vd-card p-4 mb-4">
        <h5 className="fw-bold mb-3">Status Koneksi Layanan</h5>
        <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>VibeCore REST API Service</strong>
            <p className="text-muted small mb-0">{apiUrl}/api</p>
          </div>
          <span className="badge bg-success">Online & Terhubung (Port 3360)</span>
        </div>

        <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
          <div>
            <strong>Client ReadVibe (Next.js)</strong>
            <p className="text-muted small mb-0">http://localhost:3350</p>
          </div>
          <span className="badge bg-primary">Origin CORS Diizinkan</span>
        </div>
      </div>

      <div className="vd-card p-4">
        <h5 className="fw-bold mb-3">Dokumentasi Algoritma Kurasi & Bobot Editorial</h5>
        <p className="small text-muted mb-2">
          Setiap buku yang ditetapkan sebagai <strong>Editorial Pick</strong> memiliki bobot kurasi antara 50% hingga 100%.
        </p>
        <p className="small text-muted mb-0">
          Dalam algoritma <strong>AI Vibe Matcher</strong>, buku pilihan editor mendapatkan penambahan skor bobot prioritas (+15%) sehingga selalu mendapat sorotan utama pada hasil kurasi suasana hati pembaca.
        </p>
      </div>
    </div>
  );
}
