import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 border-top text-center text-muted small bg-white mt-auto">
      <div className="container">
        <p className="mb-1 fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
          ReadVibe &bull; Ekosistem Kurasi Mood Pembaca
        </p>
        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
          Terhubung dengan VibeCore API (Port 3360) &bull; CMS didukung oleh VibeDesk (Port 3355)
        </p>
      </div>
    </footer>
  );
}
