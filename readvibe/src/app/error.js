'use client';

import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Next.js Page Error:', error);
  }, [error]);

  return (
    <div className="container py-5 text-center">
      <div className="p-5 bg-white rounded-4 shadow-sm border mx-auto" style={{ maxWidth: '500px' }}>
        <h3 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)' }}>
          Terjadi Kendala
        </h3>
        <p className="text-muted small mb-4">
          Halaman tidak dapat dimuat saat ini. Pastikan backend VibeCore (port 3360) telah berjalan.
        </p>
        <button
          type="button"
          className="btn btn-rv-plum rounded-pill px-4"
          onClick={() => reset()}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
