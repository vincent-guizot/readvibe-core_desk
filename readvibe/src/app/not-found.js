import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <div className="p-5 bg-white rounded-4 shadow-sm border mx-auto" style={{ maxWidth: '480px' }}>
        <h1 className="display-4 fw-bold" style={{ color: '#D96B50' }}>
          404
        </h1>
        <h4 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          Page Not Found
        </h4>
        <p className="text-muted small mb-4">
          The book or page you are looking for may have been moved, finished, or is resting in another wing of the library.
        </p>
        <Link href="/" className="btn btn-rv-plum rounded-pill px-4">
          Return to Discover
        </Link>
      </div>
    </div>
  );
}
