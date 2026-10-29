import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <div className="p-5 bg-white rounded-4 shadow-sm border mx-auto" style={{ maxWidth: '480px' }}>
        <h1 className="display-4 fw-bold" style={{ color: 'var(--rv-vibe-coral)' }}>
          404
        </h1>
        <h4 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)' }}>
          Halaman Tidak Ditemukan
        </h4>
        <p className="text-muted small mb-4">
          Buku atau halaman yang Anda cari mungkin telah dipindahkan atau belum terdaftar.
        </p>
        <Link href="/" className="btn btn-rv-plum rounded-pill px-4">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
